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
import { and, count, desc, eq, ilike, inArray, isNull, lt, notInArray, or } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { allowedOrigins, env, googleOAuthEnabled } from "@/config";
import { db } from "@/db/index";
import { auditLogs, documents, jobs, moderationCases, notifications, platformSettings, profileSections, profiles, taarufProcesses, users } from "@/db/schema";
import { decryptBuffer, decryptJson, encryptBuffer, encryptJson } from "@/lib/crypto";
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
const avatarStoragePath = path.join(env.PRIVATE_STORAGE_PATH ?? "/tmp/taaruf-private", "avatars");
app.use("/uploads/avatars", express.static(avatarStoragePath, { fallthrough: false, maxAge: "1d" }));

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

app.get("/api/public/avatar-config", asyncRoute(async (_req, res) => {
  const rows = await db.select({ key: platformSettings.key, value: platformSettings.value }).from(platformSettings).where(inArray(platformSettings.key, ["avatar.participant_male", "avatar.participant_female"]));
  const values = new Map(rows.map((row) => [row.key, row.value]));
  res.set("cache-control", "public, max-age=60, stale-while-revalidate=300").json({ data: {
    participant_male: values.get("avatar.participant_male") ?? `${env.API_PUBLIC_URL}/uploads/avatars/pp_ikhwan.png`,
    participant_female: values.get("avatar.participant_female") ?? `${env.API_PUBLIC_URL}/uploads/avatars/pp_akhwat.png`,
  } });
}));

app.get("/api/public/regions/:level/:code", asyncRoute(async (req, res) => {
  const level = z.enum(["provinces", "regencies", "districts", "villages"]).safeParse(req.params.level);
  if (!level.success) return void res.status(400).json({ error: { code: "INVALID_REGION_LEVEL", message: "Tingkat wilayah tidak valid." } });
  const code = String(req.params.code ?? "");
  if (level.data !== "provinces" && !/^\d+(\.\d+){0,3}$/.test(code)) return void res.status(400).json({ error: { code: "INVALID_REGION_CODE", message: "Kode wilayah tidak valid." } });
  const upstream = await fetch(level.data === "provinces" ? "https://wilayah.id/api/provinces.json" : `https://wilayah.id/api/${level.data}/${encodeURIComponent(code)}.json`);
  if (!upstream.ok) return void res.status(502).json({ error: { code: "REGION_UPSTREAM_ERROR", message: "Data wilayah belum dapat dimuat." } });
  const body = await upstream.json();
  res.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800").json({ data: body.data ?? [] });
}));

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
  const role = session.user.role;
  const isAdmin = role === "admin_male" || role === "admin_female" || role === "super_admin";
  const activeStatuses = notInArray(taarufProcesses.status, ["married", "withdrawn", "expired", "closed"]);
  const processScope = isParticipant
    ? or(eq(taarufProcesses.maleParticipantId, session.user.id), eq(taarufProcesses.femaleParticipantId, session.user.id))
    : role === "guardian"
      ? eq(taarufProcesses.guardianId, session.user.id)
      : role === "mediator"
        ? eq(taarufProcesses.mediatorId, session.user.id)
        : undefined;
  const verificationScope = role === "admin_male"
    ? eq(users.role, "participant_male")
    : role === "admin_female"
      ? eq(users.role, "participant_female")
      : undefined;
  const participantScope = role === "admin_male"
    ? eq(users.role, "participant_male")
    : role === "admin_female"
      ? eq(users.role, "participant_female")
      : inArray(users.role, ["participant_male", "participant_female"]);

  const [
    [verificationQueue],
    [activeProcesses],
    [unreadNotifications],
    [openCases],
    [totalParticipants],
    [overdueProcesses],
    recentActivity,
  ] = await Promise.all([
    isAdmin
      ? db.select({ value: count() }).from(documents).innerJoin(users, eq(documents.ownerId, users.id)).where(and(inArray(documents.status, ["pending", "processing"]), verificationScope))
      : Promise.resolve([{ value: 0 }]),
    db.select({ value: count() }).from(taarufProcesses).where(and(activeStatuses, processScope)),
    db.select({ value: count() }).from(notifications).where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt))),
    isAdmin
      ? db.select({ value: count() }).from(moderationCases).where(eq(moderationCases.status, "open"))
      : Promise.resolve([{ value: 0 }]),
    isAdmin
      ? db.select({ value: count() }).from(users).where(participantScope)
      : Promise.resolve([{ value: 0 }]),
    db.select({ value: count() }).from(taarufProcesses).where(and(activeStatuses, processScope, lt(taarufProcesses.deadlineAt, new Date()))),
    db.select({ id: auditLogs.id, action: auditLogs.action, targetType: auditLogs.targetType, createdAt: auditLogs.createdAt })
      .from(auditLogs)
      .where(role === "super_admin" ? undefined : eq(auditLogs.actorId, session.user.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(5),
  ]);

  res.json({
    data: {
      user: session.user,
      completionPercent: profile?.completionPercent ?? 0,
      stats: {
        verificationQueue: verificationQueue.value,
        activeProcesses: activeProcesses.value,
        unreadNotifications: unreadNotifications.value,
        openCases: openCases.value,
        totalParticipants: totalParticipants.value,
        overdueProcesses: overdueProcesses.value,
      },
      recentActivity,
    },
  });
}));

const participantDirectoryQuery = z.object({
  q: z.string().trim().max(80).default(""),
});

app.get("/api/admin/participants", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const role = session.user.role;
  if (role !== "admin_male" && role !== "admin_female" && role !== "super_admin") {
    return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  }
  const parsed = participantDirectoryQuery.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: { code: "INVALID_QUERY", message: "Pencarian tidak valid." } });
  const genderScope = role === "admin_male"
    ? eq(users.role, "participant_male")
    : role === "admin_female"
      ? eq(users.role, "participant_female")
      : inArray(users.role, ["participant_male", "participant_female"]);
  const term = parsed.data.q ? `%${parsed.data.q}%` : "";
  const searchScope = term
    ? or(ilike(users.displayCode, term), ilike(users.name, term), ilike(users.email, term))
    : undefined;
  const where = and(genderScope, searchScope);
  const [rows, [total]] = await Promise.all([
    db.select({
      id: users.id,
      displayCode: users.displayCode,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      completionPercent: profiles.completionPercent,
    }).from(users).leftJoin(profiles, eq(profiles.userId, users.id)).where(where).orderBy(desc(users.createdAt)).limit(50),
    db.select({ value: count() }).from(users).where(where),
  ]);
  res.json({
    data: {
      items: rows.map(({ email, completionPercent, ...participant }) => ({
        ...participant,
        completionPercent: completionPercent ?? 0,
        ...(role === "super_admin" ? { email } : {}),
      })),
      total: total.value,
    },
  });
}));

app.get("/api/profile/sections", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const rows = await db.select({
    key: profileSections.key,
    status: profileSections.status,
    answers: profileSections.answers,
    encryptedAnswers: profileSections.encryptedAnswers,
  }).from(profileSections).where(eq(profileSections.userId, session.user.id));
  const data = rows.map((row) => {
    const definition = profileFormSections.find((item) => item.key === row.key);
    if (!definition || ["profile", "identity"].includes(row.key)) return { key: row.key, status: row.status };
    let answers = (row.answers ?? {}) as Record<string, unknown>;
    if (row.encryptedAnswers) {
      try { answers = decryptJson<Record<string, unknown>>(row.encryptedAnswers); } catch { answers = {}; }
    }
    const applicableFields = definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(session.user.role as "participant_male" | "participant_female"));
    const hasRequiredAnswers = applicableFields.every((field) => field.required === false || String(answers[field.name] ?? "").trim());
    return { key: row.key, status: row.status === "complete" && hasRequiredAnswers ? "complete" : "draft" };
  });
  res.json({ data });
}));

app.get("/api/profile/sections/:section", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const definition = profileFormSections.find((item) => item.key === req.params.section);
  if (!definition || definition.key === "profile" || definition.key === "identity") return void res.status(404).json({ error: { code: "UNKNOWN_SECTION", message: "Bagian biodata tidak ditemukan." } });
  const [row] = await db.select({ answers: profileSections.answers, encryptedAnswers: profileSections.encryptedAnswers }).from(profileSections).where(and(eq(profileSections.userId, session.user.id), eq(profileSections.key, definition.key))).limit(1);
  if (!row) return res.json({ data: {} });
  if (row.encryptedAnswers) {
    try { return res.json({ data: decryptJson<Record<string, unknown>>(row.encryptedAnswers) }); } catch { return res.json({ data: {} }); }
  }
  res.json({ data: (row.answers ?? {}) as Record<string, unknown> });
}));

app.get("/api/profile/core", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const [row] = await db.select({ encryptedAnswers: profileSections.encryptedAnswers }).from(profileSections).where(and(eq(profileSections.userId, session.user.id), eq(profileSections.key, "profile"))).limit(1);
  if (!row?.encryptedAnswers) return res.json({ data: {} });
  try { return res.json({ data: decryptJson<Record<string, unknown>>(row.encryptedAnswers) }); } catch { return res.json({ data: {} }); }
}));

const profileCoreSchema = z.object({
  fullName: z.string().trim().min(3).max(120), gender: z.enum(["Ikhwan", "Akhwat"]), birthDate: z.coerce.date(), birthPlace: z.string().trim().min(2).max(100), phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/), province: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80), district: z.string().trim().min(2).max(80), village: z.string().trim().min(2).max(80), originCity: z.string().trim().min(2).max(100), maritalStatus: z.string().min(1).max(60), marriageForm: z.string().min(1).max(100), occupation: z.string().trim().min(3).max(500), salaryRange: z.string().min(1).max(80), educationLevel: z.string().min(1).max(80), manhaj: z.string().trim().min(2).max(120), ethnicity: z.string().trim().min(2).max(80), quranReading: z.string().min(1).max(80), quranMemorization: z.string().min(1).max(80), prayer: z.string().min(1).max(120), studyFrequency: z.string().min(1).max(80), music: z.string().min(1).max(80), smoking: z.string().min(1).max(40), widowMarriage: z.string().min(1).max(40), heightCm: z.coerce.number().int().min(120).max(230).optional(), weightKg: z.coerce.number().int().min(30).max(250).optional(),
});

app.put("/api/profile/core", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!session.user.role.startsWith("participant_")) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  const parsed = profileCoreSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: { code: "INVALID_PROFILE", message: "Semua field wajib diisi dengan format yang benar." } });
  const value = parsed.data;
  await db.update(users).set({ phone: value.phone, updatedAt: new Date() }).where(eq(users.id, session.user.id));
  await db.insert(profiles).values({ userId: session.user.id, birthDate: value.birthDate, province: value.province, city: value.city, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, educationLevel: value.educationLevel, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent: 6 }).onConflictDoUpdate({ target: profiles.userId, set: { birthDate: value.birthDate, province: value.province, city: value.city, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, educationLevel: value.educationLevel, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent: 6, updatedAt: new Date() } });
  const protectedIdentity = encryptJson(value);
  await db.insert(profileSections).values({ userId: session.user.id, key: "profile", status: "complete", answers: { fullNameProtected: true, gender: value.gender }, encryptedAnswers: protectedIdentity }).onConflictDoUpdate({ target: [profileSections.userId, profileSections.key], set: { status: "complete", answers: { fullNameProtected: true, gender: value.gender }, encryptedAnswers: protectedIdentity, updatedAt: new Date() } });
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "profile.section.saved", targetType: "profile_section", targetId: "profile", metadata: { section: "profile" } });
  res.json({ data: { ok: true } });
}));

app.put("/api/profile/sections/:section", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const definition = profileFormSections.find((item) => item.key === req.params.section);
  if (!definition || ["profile", "identity"].includes(definition.key)) return void res.status(404).json({ error: { code: "UNKNOWN_SECTION", message: "Bagian biodata tidak ditemukan." } });
  const applicableFields = definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(session.user.role as "participant_male" | "participant_female"));
  const answers = Object.fromEntries(applicableFields.map((field) => [field.name, String(req.body?.[field.name] ?? "").trim()]));
  if (applicableFields.some((field) => field.required !== false && !answers[field.name])) return void res.status(400).json({ error: { code: "INCOMPLETE_SECTION", message: "Lengkapi semua pertanyaan yang bertanda wajib." } });
  const sensitive = sensitiveSectionKeys.has(definition.key) || applicableFields.some((field) => field.sensitive);
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
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

app.post("/api/admin/avatar-defaults", upload.single("file"), asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!["admin_male", "admin_female", "super_admin"].includes(session.user.role)) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Hanya admin yang dapat mengatur avatar default." } });
  const gender = z.enum(["participant_male", "participant_female"]).safeParse(req.body.gender);
  if (!gender.success || !req.file) return void res.status(400).json({ error: { code: "INVALID_AVATAR", message: "Pilih gender dan file avatar PNG/JPEG." } });
  if ((session.user.role === "admin_male" && gender.data !== "participant_male") || (session.user.role === "admin_female" && gender.data !== "participant_female")) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin hanya dapat mengatur avatar sesuai wilayah gendernya." } });
  const mimeType = detectedMime(req.file.buffer);
  if (!mimeType) return void res.status(415).json({ error: { code: "UNSUPPORTED_AVATAR", message: "File avatar harus PNG atau JPEG yang valid." } });
  await mkdir(avatarStoragePath, { recursive: true, mode: 0o750 });
  const filename = `${gender.data === "participant_male" ? "pp_ikhwan" : "pp_akhwat"}.${mimeType === "image/png" ? "png" : "jpg"}`;
  await writeFile(path.join(avatarStoragePath, filename), req.file.buffer, { mode: 0o640 });
  const url = `${env.API_PUBLIC_URL}/uploads/avatars/${filename}?v=${Date.now()}`;
  await db.insert(platformSettings).values({ key: `avatar.${gender.data}`, value: url, updatedBy: session.user.id }).onConflictDoUpdate({ target: platformSettings.key, set: { value: url, updatedBy: session.user.id, updatedAt: new Date() } });
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "avatar.default.updated", targetType: "platform_setting", targetId: `avatar.${gender.data}`, metadata: { mimeType, size: req.file.size } });
  res.status(201).json({ data: { gender: gender.data, url } });
}));

app.post("/api/documents", upload.single("file"), asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const kind = allowedKinds.safeParse(req.body.kind);
  if (!kind.success || !req.file) return void res.status(400).json({ error: { code: "INVALID_DOCUMENT", message: "File wajib JPEG/PNG dan maksimal 5 MB." } });
  const mimeType = detectedMime(req.file.buffer);
  if (!mimeType) return void res.status(415).json({ error: { code: "UNSUPPORTED_DOCUMENT", message: "Isi file bukan JPEG, PNG, atau WebP yang valid." } });
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
