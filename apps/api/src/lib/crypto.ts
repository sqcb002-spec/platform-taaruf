import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

function keyFromEnv(name: "DOCUMENT_ENCRYPTION_KEY" | "NIK_HMAC_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum dikonfigurasi`);
  return createHmac("sha256", "platform-taaruf-key-derivation")
    .update(value)
    .digest();
}

export function encryptBuffer(input: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    keyFromEnv("DOCUMENT_ENCRYPTION_KEY"),
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  return Buffer.concat([
    Buffer.from("TS01"),
    iv,
    cipher.getAuthTag(),
    encrypted,
  ]);
}

export function decryptBuffer(input: Buffer) {
  if (input.subarray(0, 4).toString() !== "TS01")
    throw new Error("Format dokumen tidak valid");
  const iv = input.subarray(4, 16);
  const tag = input.subarray(16, 32);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyFromEnv("DOCUMENT_ENCRYPTION_KEY"),
    iv,
  );
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(input.subarray(32)), decipher.final()]);
}

export function encryptJson(value: unknown) {
  return encryptBuffer(Buffer.from(JSON.stringify(value))).toString("base64");
}

export function fingerprintNik(nik: string) {
  return createHmac("sha256", keyFromEnv("NIK_HMAC_KEY"))
    .update(nik.replace(/\D/g, ""))
    .digest("hex");
}
