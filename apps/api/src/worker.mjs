import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const execute = promisify(execFile);
const required = [
  "DATABASE_URL",
  "PRIVATE_STORAGE_PATH",
  "DOCUMENT_ENCRYPTION_KEY",
];
for (const name of required)
  if (!process.env[name]) throw new Error(`${name} belum dikonfigurasi`);
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function key() {
  return createHmac("sha256", "platform-taaruf-key-derivation")
    .update(process.env.DOCUMENT_ENCRYPTION_KEY)
    .digest();
}
function decrypt(input) {
  if (input.subarray(0, 4).toString() !== "TS01")
    throw new Error("INVALID_DOCUMENT_FORMAT");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    input.subarray(4, 16),
  );
  decipher.setAuthTag(input.subarray(16, 32));
  return Buffer.concat([decipher.update(input.subarray(32)), decipher.final()]);
}
function encrypt(input) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(input), cipher.final()]);
  return Buffer.concat([Buffer.from("TS01"), iv, cipher.getAuthTag(), body]);
}
async function claim() {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      "select id, payload, attempts from jobs where type = 'document.verify' and status = 'queued' and available_at <= now() order by created_at for update skip locked limit 1",
    );
    if (!result.rows[0]) {
      await client.query("rollback");
      return null;
    }
    await client.query(
      "update jobs set status = 'running', locked_at = now(), attempts = attempts + 1 where id = $1",
      [result.rows[0].id],
    );
    await client.query("commit");
    return result.rows[0];
  } finally {
    client.release();
  }
}
async function processDocument(job) {
  const documentId = job.payload.documentId;
  const result = await pool.query(
    "select storage_key, mime_type from documents where id = $1",
    [documentId],
  );
  const document = result.rows[0];
  if (!document) throw new Error("DOCUMENT_NOT_FOUND");
  await pool.query("update documents set status = 'processing' where id = $1", [
    documentId,
  ]);
  const work = await mkdtemp(path.join(tmpdir(), "taaruf-doc-"));
  const source = path.join(
    work,
    document.mime_type === "image/png" ? "identity.png" : "identity.jpg",
  );
  try {
    const encrypted = await readFile(
      path.join(process.env.PRIVATE_STORAGE_PATH, document.storage_key),
    );
    await writeFile(source, decrypt(encrypted), { mode: 0o600 });
    try {
      await execute("clamscan", ["--no-summary", source], { timeout: 60000 });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 1
      ) {
        await rm(
          path.join(process.env.PRIVATE_STORAGE_PATH, document.storage_key),
          { force: true },
        );
        await pool.query(
          "update documents set status = 'rejected' where id = $1",
          [documentId],
        );
        await pool.query(
          "update jobs set status = 'completed', locked_at = null, last_error = 'MALWARE_DETECTED' where id = $1",
          [job.id],
        );
        return;
      }
      throw error;
    }
    const { stdout } = await execute(
      "tesseract",
      [source, "stdout", "-l", "ind+eng", "--psm", "6"],
      { timeout: 90000, maxBuffer: 1024 * 1024 },
    );
    const normalized = stdout.replace(/\s+/g, " ").trim();
    const nik = normalized.match(/\b\d{16}\b/)?.[0] ?? null;
    const ocr = encrypt(
      Buffer.from(
        JSON.stringify({
          text: normalized.slice(0, 4000),
          nikDetected: Boolean(nik),
        }),
      ),
    ).toString("base64");
    await pool.query(
      "update documents set status = 'pending', ocr_result_encrypted = $2 where id = $1",
      [documentId, ocr],
    );
    await pool.query(
      "update jobs set status = 'completed', locked_at = null, last_error = null where id = $1",
      [job.id],
    );
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}
async function fail(job, error) {
  const retry = Number(job.attempts) < 3;
  await pool.query(
    "update jobs set status = $2, locked_at = null, last_error = $3, available_at = now() + interval '5 minutes' where id = $1",
    [job.id, retry ? "queued" : "failed", String(error).slice(0, 1000)],
  );
  if (!retry && job.payload.documentId)
    await pool.query(
      "update documents set status = 'needs_revision' where id = $1",
      [job.payload.documentId],
    );
}
async function main() {
  await mkdir(process.env.PRIVATE_STORAGE_PATH, {
    recursive: true,
    mode: 0o700,
  });
  for (;;) {
    const job = await claim();
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    try {
      await processDocument(job);
    } catch (error) {
      await fail(job, error);
    }
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
