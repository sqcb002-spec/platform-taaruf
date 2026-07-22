import { mkdir, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, documents, jobs } from "@/db/schema";
import { encryptBuffer } from "@/lib/crypto";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
const allowedKinds = z.enum([
  "identity_card",
  "identity_selfie",
  "profile_photo",
]);
const MAX_BYTES = 5 * 1024 * 1024;

function detectedMime(buffer: Buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  )
    return "image/jpeg";
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  return null;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const role = String((session.user as { role?: string }).role);
  if (!role.startsWith("participant_") && role !== "guardian")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const form = await request.formData();
  const kind = allowedKinds.safeParse(form.get("kind"));
  const file = form.get("file");
  if (
    !kind.success ||
    !(file instanceof File) ||
    file.size < 1 ||
    file.size > MAX_BYTES
  )
    return NextResponse.json(
      { error: "File wajib JPEG/PNG dan maksimal 5 MB." },
      { status: 400 },
    );
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = detectedMime(buffer);
  if (!mimeType)
    return NextResponse.json(
      { error: "Isi file bukan JPEG atau PNG yang valid." },
      { status: 415 },
    );
  const storageRoot = process.env.PRIVATE_STORAGE_PATH;
  if (!storageRoot)
    return NextResponse.json(
      { error: "Penyimpanan privat belum dikonfigurasi." },
      { status: 503 },
    );
  const storageKey = `${randomUUID()}.tsenc`;
  await mkdir(storageRoot, { recursive: true, mode: 0o700 });
  await writeFile(path.join(storageRoot, storageKey), encryptBuffer(buffer), {
    mode: 0o600,
    flag: "wx",
  });
  const [document] = await db
    .insert(documents)
    .values({
      ownerId: session.user.id,
      kind: kind.data,
      storageKey,
      contentHash: createHash("sha256").update(buffer).digest("hex"),
      mimeType,
      sizeBytes: buffer.byteLength,
    })
    .returning({ id: documents.id });
  await db
    .insert(jobs)
    .values({ type: "document.verify", payload: { documentId: document.id } });
  await db
    .insert(auditLogs)
    .values({
      actorId: session.user.id,
      action: "document.uploaded",
      targetType: "document",
      targetId: document.id,
      metadata: { kind: kind.data, size: buffer.byteLength },
    });
  return NextResponse.json(
    { id: document.id, status: "pending" },
    { status: 201 },
  );
}
