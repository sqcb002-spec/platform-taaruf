import "./config";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { allowedOrigins, env, googleOAuthEnabled } from "@/config";
import { db } from "@/db/index";
import { auditLogs, documents, jobs, profileSections, profiles, users } from "@/db/schema";
import { decryptBuffer, encryptBuffer, encryptJson } from "@/lib/crypto";
import { profileFormSections, sensitiveSectionKeys } from "@/lib/profile-form";
import { getSession } from "@/session";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(pinoHttp());
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    callback(new Error("ORIGIN_NOT_ALLOWED"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Requested-With"],
}));

// Better Auth must receive the untouched body before express.json().
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "1mb" }));

app.get("/api/public/auth-providers", (_req, res) => {
  res.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
  res.json({ data: { google: googleOAuthEnabled } });
});

const asyncRoute = (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res)).catch(next);

async function requireUser(req: Request, res: Response) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sesi Anda telah berakhir." } });
    return null;
  }
  return session;
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "taaruf-api", time: new Date().toISOString() }));
app.get("/ready", asyncRoute(async (_req, res) => {
  await db.select({ id: users.id }).from(users).limit(1);
  res.json({ ok: true, database: "connected" });
}));

const registration = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12).max(128),
  participantRole: z.enum(["participant_male", "participant_female"]),
  ageConfirmed: z.union([z.literal("on"), z.literal(true)]),
});

app.post("/api/register", asyncRoute(async (req, res) => {
  const parsed = registration.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: { code: "INVALID_REGISTRATION", message: "Periksa kembali data pendaftaran." } });
  try {
    const result = await auth.api.signUpEmail({ body: { name: parsed.data.name, email: parsed.data.email, password: parsed.data.password, callbackURL: `${env.DASHBOARD_ORIGIN}/masuk` } });
    if (!result.user?.id) throw new Error("USER_NOT_CREATED");
    await db.update(users).set({ role: parsed.data.participantRole }).where(eq(users.id, result.user.id));
    res.status(201).json({ data: { ok: true } });
  } catch (error) {
    req.log.warn({ err: error }, "registration.failed");
    res.status(409).json({ error: { code: "REGISTRATION_CONFLICT", message: "Email mungkin sudah terdaftar atau permintaan terlalu sering." } });
  }
}));

app.get("/api/me", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (session) res.json({ data: session });
}));

app.get("/api/dashboard/summary", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const isParticipant = session.user.role.startsWith("participant_");
  const [profile] = isParticipant ? await db.select({ completionPercent: profiles.completionPercent }).from(profiles).where(eq(profiles.userId, session.user.id)).limit(1) : [];
  res.json({ data: { user: session.user, completionPercent: profile?.completionPercent ?? 0 } });
}));

app.get("/api/profile/sections", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const rows = await db.select({ key: profileSections.key, status: profileSections.status }).from(profileSections).where(eq(profileSections.userId, session.user.id));
  res.json({ data: rows });
}));

const profileCoreSchema = z.object({
  username: z.string().trim().min(3).max(40), gender: z.enum(["Ikhwan", "Akhwat"]), birthDate: z.coerce.date(), maritalStatus: z.string().min(1).max(60), province: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80), manhaj: z.string().trim().min(2).max(120), ethnicity: z.string().trim().min(2).max(80), heightCm: z.coerce.number().int().min(120).max(230), weightKg: z.coerce.number().int().min(30).max(250), occupation: z.string().trim().min(3).max(500),
});

app.put("/api/profile/core", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!session.user.role.startsWith("participant_")) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  const parsed = profileCoreSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: { code: "INVALID_PROFILE", message: "Semua field wajib diisi dengan format yang benar." } });
  const value = parsed.data;
  await db.insert(profiles).values({ userId: session.user.id, birthDate: value.birthDate, province: value.province, city: value.city, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent: 6 }).onConflictDoUpdate({ target: profiles.userId, set: { birthDate: value.birthDate, province: value.province, city: value.city, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent: 6, updatedAt: new Date() } });
  await db.insert(profileSections).values({ userId: session.user.id, key: "profile", status: "complete", answers: { username: value.username, gender: value.gender } }).onConflictDoUpdate({ target: [profileSections.userId, profileSections.key], set: { status: "complete", answers: { username: value.username, gender: value.gender }, updatedAt: new Date() } });
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "profile.section.saved", targetType: "profile_section", targetId: "profile", metadata: { section: "profile" } });
  res.json({ data: { ok: true } });
}));

app.put("/api/profile/sections/:section", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const definition = profileFormSections.find((item) => item.key === req.params.section);
  if (!definition || ["profile", "identity"].includes(definition.key)) return void res.status(404).json({ error: { code: "UNKNOWN_SECTION", message: "Bagian biodata tidak ditemukan." } });
  const answers = Object.fromEntries(definition.fields.map((field) => [field.name, String(req.body?.[field.name] ?? "").trim()]));
  if (Object.values(answers).some((answer) => answer.length < 1)) return void res.status(400).json({ error: { code: "INCOMPLETE_SECTION", message: "Semua pertanyaan pada bagian ini wajib dijawab." } });
  const sensitive = sensitiveSectionKeys.has(definition.key) || definition.fields.some((field) => field.sensitive);
  await db.insert(profileSections).values({ userId: session.user.id, key: definition.key, status: "complete", answers: sensitive ? { protected: true } : answers, encryptedAnswers: sensitive ? encryptJson(answers) : null }).onConflictDoUpdate({ target: [profileSections.userId, profileSections.key], set: { status: "complete", answers: sensitive ? { protected: true } : answers, encryptedAnswers: sensitive ? encryptJson(answers) : null, updatedAt: new Date() } });
  const [completed] = await db.select({ value: count() }).from(profileSections).where(and(eq(profileSections.userId, session.user.id), eq(profileSections.status, "complete")));
  const completionPercent = Math.min(100, Math.round((completed.value / profileFormSections.length) * 100));
  await db.insert(profiles).values({ userId: session.user.id, completionPercent }).onConflictDoUpdate({ target: profiles.userId, set: { completionPercent, updatedAt: new Date() } });
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "profile.section.saved", targetType: "profile_section", targetId: definition.key, metadata: { section: definition.key, protected: sensitive } });
  res.json({ data: { ok: true, completionPercent } });
}));

const allowedKinds = z.enum(["identity_card", "identity_selfie", "profile_photo"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
function detectedMime(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  return null;
}

app.post("/api/documents", upload.single("file"), asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const kind = allowedKinds.safeParse(req.body.kind);
  if (!kind.success || !req.file) return void res.status(400).json({ error: { code: "INVALID_DOCUMENT", message: "File wajib JPEG/PNG dan maksimal 5 MB." } });
  const mimeType = detectedMime(req.file.buffer);
  if (!mimeType) return void res.status(415).json({ error: { code: "UNSUPPORTED_DOCUMENT", message: "Isi file bukan JPEG atau PNG yang valid." } });
  if (!env.PRIVATE_STORAGE_PATH || !env.DOCUMENT_ENCRYPTION_KEY) return void res.status(503).json({ error: { code: "STORAGE_UNAVAILABLE", message: "Penyimpanan privat belum tersedia." } });
  const storageKey = `${randomUUID()}.tsenc`;
  await mkdir(env.PRIVATE_STORAGE_PATH, { recursive: true, mode: 0o700 });
  await writeFile(path.join(env.PRIVATE_STORAGE_PATH, storageKey), encryptBuffer(req.file.buffer), { mode: 0o600, flag: "wx" });
  const [document] = await db.insert(documents).values({ ownerId: session.user.id, kind: kind.data, storageKey, contentHash: createHash("sha256").update(req.file.buffer).digest("hex"), mimeType, sizeBytes: req.file.buffer.byteLength }).returning({ id: documents.id });
  await Promise.all([
    db.insert(jobs).values({ type: "document.verify", payload: { documentId: document.id } }),
    db.insert(auditLogs).values({ actorId: session.user.id, action: "document.uploaded", targetType: "document", targetId: document.id, metadata: { kind: kind.data, size: req.file.buffer.byteLength } }),
  ]);
  res.status(201).json({ data: { id: document.id, status: "pending" } });
}));

app.get("/api/documents/:id", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const documentId = String(req.params.id);
  const [record] = await db.select({ document: documents, ownerRole: users.role }).from(documents).innerJoin(users, eq(users.id, documents.ownerId)).where(eq(documents.id, documentId)).limit(1);
  if (!record) return void res.status(404).json({ error: { code: "NOT_FOUND", message: "Dokumen tidak ditemukan." } });
  const sameOwner = record.document.ownerId === session.user.id;
  const genderAdmin = (session.user.role === "admin_male" && record.ownerRole === "participant_male") || (session.user.role === "admin_female" && record.ownerRole === "participant_female");
  if (!sameOwner && !genderAdmin && session.user.role !== "super_admin") return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  if (!env.PRIVATE_STORAGE_PATH) return void res.status(503).json({ error: { code: "STORAGE_UNAVAILABLE", message: "Penyimpanan privat belum tersedia." } });
  const plain = decryptBuffer(await readFile(path.join(env.PRIVATE_STORAGE_PATH, record.document.storageKey)));
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "document.viewed", targetType: "document", targetId: documentId, metadata: { reason: sameOwner ? "owner" : "verification" } });
  res.set({ "content-type": record.document.mimeType, "content-disposition": "inline", "cache-control": "private, no-store, max-age=0", "x-content-type-options": "nosniff" }).send(plain);
}));

app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Endpoint tidak ditemukan." } }));
app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err: error }, "request.failed");
  if (error instanceof multer.MulterError) return res.status(400).json({ error: { code: "UPLOAD_REJECTED", message: "File tidak dapat diproses atau melebihi 5 MB." } });
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Layanan mengalami gangguan. Silakan coba kembali." }, requestId: req.id });
});

app.listen(env.PORT, "127.0.0.1", () => {
  console.info(`taaruf-api listening on http://127.0.0.1:${env.PORT}`);
});
