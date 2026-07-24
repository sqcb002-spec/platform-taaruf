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
import { and, count, desc, eq, gt, ilike, inArray, isNull, lt, ne, notInArray, or } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { allowedOrigins, env, googleOAuthEnabled } from "@/config";
import { db } from "@/db/index";
import { auditLogs, documents, jobs, moderationCases, notifications, partnerPreferences, platformSettings, processEvents, profileSections, profiles, recommendations, taarufProcesses, users } from "@/db/schema";
import { decryptBuffer, decryptJson, encryptBuffer, encryptJson } from "@/lib/crypto";
import { profileFormSections, requiredProfileSectionKeys, sensitiveSectionKeys } from "@/lib/profile-form";
import { createProposal, decideGuardian, decideProposal, withdrawProcess } from "@/lib/workflows";
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
    participant_male: values.get("avatar.participant_male") ?? `${env.DASHBOARD_ORIGIN}/avatars/pp_ikhwan.png`,
    participant_female: values.get("avatar.participant_female") ?? `${env.DASHBOARD_ORIGIN}/avatars/pp_akhwat.png`,
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

function ageBand(birthDate: Date | null) {
  if (!birthDate) return "Usia belum tersedia";
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPassed = today.getUTCMonth() > birthDate.getUTCMonth()
    || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayPassed) age -= 1;
  const lower = Math.max(18, Math.floor(age / 5) * 5);
  return `${lower}–${lower + 4} tahun`;
}

function ageFromBirthDate(birthDate: Date | null) {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPassed = today.getUTCMonth() > birthDate.getUTCMonth()
    || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function normalizedMaritalStatus(value: string | null) {
  const status = value?.toLowerCase() ?? "";
  if (status.includes("belum") || status.includes("lajang") || status.includes("single")) return "never_married";
  if (status.includes("cerai mati") || status.includes("wafat")) return "widowed";
  if (status.includes("cerai hidup")) return "divorced";
  return status;
}

function acceptsMaritalStatus(accepted: unknown, status: string | null) {
  if (!Array.isArray(accepted) || accepted.length === 0) return true;
  const normalizedCandidate = normalizedMaritalStatus(status);
  return accepted.some((item) => typeof item === "string" && normalizedMaritalStatus(item) === normalizedCandidate);
}

async function refreshRecommendationsForParticipant(userId: string) {
  const [actor] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      displayCode: users.displayCode,
      profile: profiles,
      preferences: partnerPreferences,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(partnerPreferences, eq(partnerPreferences.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!actor?.role.startsWith("participant_") || actor.profile.completionPercent < 100) return;

  if (["profile_incomplete", "pending_identity", "under_review", "self_inactive"].includes(actor.status)) {
    await db.update(users).set({ status: "active_search", updatedAt: new Date() }).where(eq(users.id, userId));
  }

  const oppositeRole = actor.role === "participant_male" ? "participant_female" : "participant_male";
  const actorIsTest = actor.displayCode.startsWith("TEST-");
  const candidateRows = await db
    .select({
      id: users.id,
      displayCode: users.displayCode,
      status: users.status,
      profile: profiles,
      preferences: partnerPreferences,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(partnerPreferences, eq(partnerPreferences.userId, users.id))
    .where(and(
      eq(users.role, oppositeRole),
      ne(users.id, userId),
      eq(profiles.completionPercent, 100),
      inArray(users.status, ["profile_incomplete", "under_review", "active_search"]),
    ))
    .limit(100);

  const preferredProvinces = Array.isArray(actor.preferences?.provinces) ? actor.preferences.provinces.filter((item): item is string => typeof item === "string") : [];
  const preferredEducation = Array.isArray(actor.preferences?.educationLevels) ? actor.preferences.educationLevels.filter((item): item is string => typeof item === "string") : [];
  const preferredMaritalStatuses = Array.isArray(actor.preferences?.maritalStatuses) ? actor.preferences.maritalStatuses.filter((item): item is string => typeof item === "string") : [];
  const expiresAt = new Date(Date.now() + 30 * 86400000);
  const actorAge = ageFromBirthDate(actor.profile.birthDate);
  const eligibleCandidates = candidateRows.filter((candidate) => {
    if (candidate.displayCode.startsWith("TEST-") !== actorIsTest) return false;
    const candidateAge = ageFromBirthDate(candidate.profile.birthDate);
    if (actor.preferences && candidateAge !== null && (candidateAge < actor.preferences.minAge || candidateAge > actor.preferences.maxAge)) return false;
    if (candidate.preferences && actorAge !== null && (actorAge < candidate.preferences.minAge || actorAge > candidate.preferences.maxAge)) return false;
    if (!acceptsMaritalStatus(actor.preferences?.maritalStatuses, candidate.profile.maritalStatus)) return false;
    if (!acceptsMaritalStatus(candidate.preferences?.maritalStatuses, actor.profile.maritalStatus)) return false;
    return true;
  });

  await db.delete(recommendations).where(and(
    eq(recommendations.userId, userId),
    inArray(recommendations.source, ["test_seed", "profile_matching"]),
  ));

  for (const candidate of eligibleCandidates) {
    let score = 58;
    const reasons: string[] = [];
    const candidateAge = ageFromBirthDate(candidate.profile.birthDate);
    if (candidateAge !== null && actor.preferences && candidateAge >= actor.preferences.minAge && candidateAge <= actor.preferences.maxAge) {
      score += 14;
      reasons.push("Rentang usia berada dalam kriteria yang dipilih");
    }
    const candidateProvince = candidate.profile.province;
    if (candidateProvince && preferredProvinces.some((province) => candidateProvince.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(candidateProvince.toLowerCase()))) {
      score += 10;
      reasons.push("Domisili termasuk wilayah yang dapat dipertimbangkan");
    }
    if (candidate.profile.educationLevel && preferredEducation.includes(candidate.profile.educationLevel)) {
      score += 6;
      reasons.push("Latar pendidikan sesuai preferensi dasar");
    }
    if (candidate.profile.maritalStatus && preferredMaritalStatuses.includes(candidate.profile.maritalStatus)) {
      score += 6;
      reasons.push("Status pernikahan sesuai kriteria");
    }
    if (actor.profile.manhaj && candidate.profile.manhaj && actor.profile.manhaj.toLowerCase() === candidate.profile.manhaj.toLowerCase()) {
      score += 6;
      reasons.push("Arah pemahaman agama yang dicantumkan selaras");
    }
    if (actor.profile.marriageTargetMonths && candidate.profile.marriageTargetMonths && Math.abs(actor.profile.marriageTargetMonths - candidate.profile.marriageTargetMonths) <= 6) {
      score += 6;
      reasons.push("Target waktu menikah berada pada rentang yang berdekatan");
    }
    const candidatePreferredProvinces = Array.isArray(candidate.preferences?.provinces) ? candidate.preferences.provinces.filter((item): item is string => typeof item === "string") : [];
    if (actor.profile.province && candidatePreferredProvinces.some((province) => actor.profile.province?.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(actor.profile.province!.toLowerCase()))) {
      score += 5;
      reasons.push("Domisili Anda juga berada dalam jangkauan calon");
    }
    if (reasons.length === 0) reasons.push("Memenuhi batas dasar profil yang dapat ditinjau");

    await db.insert(recommendations).values({
      userId,
      candidateId: candidate.id,
      score: Math.min(98, score),
      reasons,
      source: actorIsTest ? "test_seed" : "profile_matching",
      expiresAt,
    }).onConflictDoUpdate({
      target: [recommendations.userId, recommendations.candidateId],
      set: {
        score: Math.min(98, score),
        reasons,
        source: actorIsTest ? "test_seed" : "profile_matching",
        expiresAt,
      },
    });
  }
}

async function safeCvSummaries(candidateIds: string[]) {
  if (candidateIds.length === 0) return new Map<string, Record<string, string>>();
  const rows = await db
    .select({
      userId: profileSections.userId,
      key: profileSections.key,
      answers: profileSections.answers,
      encryptedAnswers: profileSections.encryptedAnswers,
    })
    .from(profileSections)
    .where(and(
      inArray(profileSections.userId, candidateIds),
      inArray(profileSections.key, ["profile", "physical", "self", "religion", "marriage", "criteria_nonphysical", "family"]),
    ));
  const grouped = new Map<string, Record<string, Record<string, unknown>>>();
  for (const row of rows) {
    let answers = (row.answers ?? {}) as Record<string, unknown>;
    if (row.encryptedAnswers) {
      try { answers = decryptJson<Record<string, unknown>>(row.encryptedAnswers); } catch { answers = {}; }
    }
    const current = grouped.get(row.userId) ?? {};
    current[row.key] = answers;
    grouped.set(row.userId, current);
  }

  const result = new Map<string, Record<string, string>>();
  for (const candidateId of candidateIds) {
    const sections = grouped.get(candidateId) ?? {};
    const value = (section: string, field: string) => String(sections[section]?.[field] ?? "").trim();
    result.set(candidateId, {
      childOrder: value("family", "childOrder"),
      siblingCount: value("family", "siblingCount"),
      quranReading: value("profile", "quranReading"),
      quranMemorization: value("profile", "quranMemorization"),
      prayer: value("profile", "prayer"),
      studyFrequency: value("profile", "studyFrequency"),
      music: value("profile", "music"),
      smoking: value("profile", "smoking"),
      hairType: value("physical", "hairType"),
      favoriteSport: value("physical", "favoriteSport"),
      characterSummary: value("self", "characterSummary"),
      positiveTraits: value("self", "positiveTraits"),
      negativeTraits: value("self", "negativeTraits"),
      hobbies: value("self", "hobbies"),
      polygamyPosition: value("self", "polygamyPosition"),
      scholarReferences: value("religion", "scholarReferences"),
      studiesAttended: value("religion", "studiesAttended"),
      clothingPractice: value("religion", "veilPractice") || value("religion", "isbalPractice"),
      beardPractice: value("religion", "beardPractice"),
      vision: value("marriage", "vision"),
      mission: value("marriage", "mission"),
      timeline: value("marriage", "timeline"),
      desiredAge: value("criteria_nonphysical", "age"),
      desiredDomicile: value("criteria_nonphysical", "domicile"),
      desiredEducation: value("criteria_nonphysical", "education"),
      desiredCharacter: value("criteria_nonphysical", "characterCriteria"),
      nonNegotiables: value("criteria_nonphysical", "nonNegotiables"),
    });
  }
  return result;
}

app.get("/api/recommendations", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!session.user.role.startsWith("participant_")) {
    return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  }

  await refreshRecommendationsForParticipant(session.user.id);

  const rows = await db
    .select({
      id: recommendations.id,
      score: recommendations.score,
      reasons: recommendations.reasons,
      expiresAt: recommendations.expiresAt,
      candidateId: users.id,
      displayCode: users.displayCode,
      role: users.role,
      province: profiles.province,
      city: profiles.city,
      ethnicity: profiles.ethnicity,
      maritalStatus: profiles.maritalStatus,
      educationLevel: profiles.educationLevel,
      occupationField: profiles.occupationField,
      manhaj: profiles.manhaj,
      marriageTargetMonths: profiles.marriageTargetMonths,
      birthDate: profiles.birthDate,
      heightCm: profiles.heightCm,
      weightKg: profiles.weightKg,
      bodyShape: profiles.bodyShape,
      skinTone: profiles.skinTone,
    })
    .from(recommendations)
    .innerJoin(users, eq(recommendations.candidateId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(and(
      eq(recommendations.userId, session.user.id),
      gt(recommendations.expiresAt, new Date()),
      eq(users.status, "active_search"),
    ))
    .orderBy(desc(recommendations.score))
    .limit(20);

  const storedSummaries = await safeCvSummaries(rows.map((row) => row.candidateId));
  let data = rows.map((row) => ({
      id: row.id,
      score: Math.round(row.score),
      reasons: Array.isArray(row.reasons) ? row.reasons.filter((reason): reason is string => typeof reason === "string").slice(0, 4) : [],
      expiresAt: row.expiresAt,
      canPropose: true,
      candidate: {
        id: row.candidateId,
        displayCode: row.displayCode,
        role: row.role,
        ageBand: ageBand(row.birthDate),
        province: row.province,
        city: row.city,
        ethnicity: row.ethnicity,
        maritalStatus: row.maritalStatus,
        educationLevel: row.educationLevel,
        occupationField: row.occupationField,
        manhaj: row.manhaj,
        marriageTarget: row.marriageTargetMonths ? `${row.marriageTargetMonths} bulan` : "Dibicarakan saat ta’aruf",
        isTestData: row.displayCode.startsWith("TEST-"),
        heightCm: row.heightCm,
        weightKg: row.weightKg,
        bodyShape: row.bodyShape,
        skinTone: row.skinTone,
        safeCv: storedSummaries.get(row.candidateId) ?? {},
      },
    }));

  if (data.length === 0 && !session.user.displayCode.startsWith("TEST-")) {
    const [actorProfile] = await db
      .select({ profile: profiles, preferences: partnerPreferences })
      .from(profiles)
      .leftJoin(partnerPreferences, eq(partnerPreferences.userId, profiles.userId))
      .where(eq(profiles.userId, session.user.id))
      .limit(1);
    if ((actorProfile?.profile.completionPercent ?? 0) >= 100) {
      const oppositeRole = session.user.role === "participant_male" ? "participant_female" : "participant_male";
      const previewRows = await db
        .select({
          candidateId: users.id,
          displayCode: users.displayCode,
          role: users.role,
          province: profiles.province,
          city: profiles.city,
          ethnicity: profiles.ethnicity,
          maritalStatus: profiles.maritalStatus,
          educationLevel: profiles.educationLevel,
          occupationField: profiles.occupationField,
          manhaj: profiles.manhaj,
          marriageTargetMonths: profiles.marriageTargetMonths,
          birthDate: profiles.birthDate,
          heightCm: profiles.heightCm,
          weightKg: profiles.weightKg,
          bodyShape: profiles.bodyShape,
          skinTone: profiles.skinTone,
          preferences: partnerPreferences,
        })
        .from(users)
        .innerJoin(profiles, eq(profiles.userId, users.id))
        .leftJoin(partnerPreferences, eq(partnerPreferences.userId, users.id))
        .where(and(
          eq(users.role, oppositeRole),
          ilike(users.displayCode, "TEST-%"),
          eq(profiles.completionPercent, 100),
        ))
        .orderBy(users.displayCode);
      const actorAge = ageFromBirthDate(actorProfile.profile.birthDate);
      const actorPreferredProvinces = Array.isArray(actorProfile.preferences?.provinces) ? actorProfile.preferences.provinces.filter((item): item is string => typeof item === "string") : [];
      const previews = previewRows
        .filter((candidate) => {
          const candidateAge = ageFromBirthDate(candidate.birthDate);
          if (actorProfile.preferences && candidateAge !== null && (candidateAge < actorProfile.preferences.minAge || candidateAge > actorProfile.preferences.maxAge)) return false;
          if (candidate.preferences && actorAge !== null && (actorAge < candidate.preferences.minAge || actorAge > candidate.preferences.maxAge)) return false;
          if (!acceptsMaritalStatus(actorProfile.preferences?.maritalStatuses, candidate.maritalStatus)) return false;
          if (!acceptsMaritalStatus(candidate.preferences?.maritalStatuses, actorProfile.profile.maritalStatus)) return false;
          return true;
        })
        .map((candidate) => {
          let score = 58;
          const reasons = ["Kriteria usia dan status pernikahan diterima oleh kedua pihak"];
          const candidateAge = ageFromBirthDate(candidate.birthDate);
          if (candidateAge !== null && actorProfile.preferences && candidateAge >= actorProfile.preferences.minAge && candidateAge <= actorProfile.preferences.maxAge) score += 14;
          if (candidate.province && actorPreferredProvinces.some((province) => candidate.province?.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(candidate.province!.toLowerCase()))) {
            score += 10;
            reasons.push("Domisili termasuk wilayah yang Anda pertimbangkan");
          }
          const candidateProvinces = Array.isArray(candidate.preferences?.provinces) ? candidate.preferences.provinces.filter((item): item is string => typeof item === "string") : [];
          if (actorProfile.profile.province && candidateProvinces.some((province) => actorProfile.profile.province?.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(actorProfile.profile.province!.toLowerCase()))) {
            score += 8;
            reasons.push("Domisili Anda juga masuk jangkauan calon");
          }
          if (actorProfile.profile.manhaj && candidate.manhaj && actorProfile.profile.manhaj.toLowerCase() === candidate.manhaj.toLowerCase()) {
            score += 8;
            reasons.push("Arah pemahaman agama yang dicantumkan selaras");
          }
          return { ...candidate, score: Math.min(96, score), reasons };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      const previewSummaries = await safeCvSummaries(previews.map((row) => row.candidateId));
      data = previews.map((row) => ({
        id: `preview-${row.candidateId}`,
        score: row.score,
        reasons: row.reasons,
        expiresAt: new Date(Date.now() + 86400000),
        canPropose: false,
        candidate: {
          id: row.candidateId,
          displayCode: row.displayCode,
          role: row.role,
          ageBand: ageBand(row.birthDate),
          province: row.province,
          city: row.city,
          ethnicity: row.ethnicity,
          maritalStatus: row.maritalStatus,
          educationLevel: row.educationLevel,
          occupationField: row.occupationField,
          manhaj: row.manhaj,
          marriageTarget: row.marriageTargetMonths ? `${row.marriageTargetMonths} bulan` : "Dibicarakan saat ta’aruf",
          isTestData: true,
          heightCm: row.heightCm,
          weightKg: row.weightKg,
          bodyShape: row.bodyShape,
          skinTone: row.skinTone,
          safeCv: previewSummaries.get(row.candidateId) ?? {},
        },
      }));
    }
  }

  res.json({ data });
}));

app.post("/api/proposals", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const parsed = z.object({ candidateId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) {
    return void res.status(400).json({ error: { code: "INVALID_PROPOSAL", message: "Calon yang dipilih tidak valid." } });
  }
  const [recommendation] = await db
    .select({ candidateId: recommendations.candidateId })
    .from(recommendations)
    .where(and(
      eq(recommendations.userId, session.user.id),
      eq(recommendations.candidateId, parsed.data.candidateId),
      gt(recommendations.expiresAt, new Date()),
    ))
    .limit(1);
  if (!recommendation) {
    return void res.status(409).json({ error: { code: "RECOMMENDATION_REQUIRED", message: "Profil ini tidak lagi berada dalam rekomendasi aktif Anda." } });
  }
  const [existingProposal] = await db
    .select({ id: taarufProcesses.id })
    .from(taarufProcesses)
    .where(and(
      eq(taarufProcesses.proposerId, session.user.id),
      eq(taarufProcesses.recipientId, parsed.data.candidateId),
      notInArray(taarufProcesses.status, ["closed", "married"]),
    ))
    .limit(1);
  if (existingProposal) {
    return void res.status(409).json({ error: { code: "PROPOSAL_ALREADY_EXISTS", message: "Pengajuan kepada calon ini sudah tercatat dan masih menunggu proses." } });
  }
  try {
    const process = await createProposal(session.user.id, parsed.data.candidateId, "sop-taaruf-1.0");
    res.status(201).json({ data: { id: process.id, status: process.status, deadlineAt: process.deadlineAt } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PROPOSAL_FAILED";
    const messages: Record<string, string> = {
      PARTICIPANT_NOT_FOUND: "Peserta tidak ditemukan.",
      INELIGIBLE_PAIR: "Pasangan peserta tidak memenuhi batas dasar.",
      TEST_ACCOUNT_ISOLATED: "Akun test hanya dapat mengajukan kepada akun test.",
      PARTICIPANT_NOT_SEARCHABLE: "Salah satu peserta sedang tidak menerima pengajuan.",
      ACTIVE_PROCESS_EXISTS: "Salah satu peserta sedang menjalani proses ta’aruf aktif.",
      PENDING_PROPOSAL_LIMIT: "Batas pengajuan yang masih menunggu sudah tercapai.",
    };
    res.status(409).json({ error: { code, message: messages[code] ?? "Pengajuan belum dapat dibuat." } });
  }
}));

app.get("/api/processes", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const isParticipant = session.user.role.startsWith("participant_");
  const isGuardian = session.user.role === "guardian";
  if (!isParticipant && !isGuardian) {
    return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Ruang proses ini tidak tersedia untuk peran Anda." } });
  }
  const scope = isParticipant
    ? or(eq(taarufProcesses.maleParticipantId, session.user.id), eq(taarufProcesses.femaleParticipantId, session.user.id))
    : eq(taarufProcesses.guardianId, session.user.id);
  const rows = await db
    .select()
    .from(taarufProcesses)
    .where(scope)
    .orderBy(desc(taarufProcesses.createdAt))
    .limit(50);
  const participantIds = [...new Set(rows.flatMap((row) => [row.maleParticipantId, row.femaleParticipantId]))];
  const participantRows = participantIds.length > 0
    ? await db
      .select({
        id: users.id,
        displayCode: users.displayCode,
        role: users.role,
        birthDate: profiles.birthDate,
        province: profiles.province,
        city: profiles.city,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(inArray(users.id, participantIds))
    : [];
  const processIds = rows.map((row) => row.id);
  const eventRows = processIds.length > 0
    ? await db
      .select({
        id: processEvents.id,
        processId: processEvents.processId,
        type: processEvents.type,
        createdAt: processEvents.createdAt,
      })
      .from(processEvents)
      .where(inArray(processEvents.processId, processIds))
      .orderBy(processEvents.createdAt)
    : [];
  const participantMap = new Map(participantRows.map((row) => [row.id, {
    id: row.id,
    displayCode: row.displayCode,
    role: row.role,
    ageBand: ageBand(row.birthDate),
    province: row.province,
    city: row.city,
  }]));
  const data = rows.map((row) => {
    const male = participantMap.get(row.maleParticipantId) ?? null;
    const female = participantMap.get(row.femaleParticipantId) ?? null;
    const counterpart = isParticipant
      ? participantMap.get(row.maleParticipantId === session.user.id ? row.femaleParticipantId : row.maleParticipantId) ?? null
      : male;
    const direction = isGuardian
      ? "guardian"
      : row.proposerId === session.user.id
        ? "outgoing"
        : "incoming";
    const canDecide = direction === "incoming" && ["awaiting_recipient", "istikharah"].includes(row.status);
    const canGuardianDecide = direction === "guardian" && row.status === "awaiting_guardian";
    return {
      id: row.id,
      status: row.status,
      direction,
      deadlineAt: row.deadlineAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      closedReason: row.closedReason,
      canDecide,
      canGuardianDecide,
      canWithdraw: isParticipant && !["closed", "withdrawn", "expired", "married"].includes(row.status),
      counterpart,
      male,
      female,
      events: eventRows.filter((event) => event.processId === row.id).map((event) => ({
        id: event.id,
        type: event.type,
        createdAt: event.createdAt,
      })),
    };
  });
  res.json({ data });
}));

app.post("/api/processes/:id/decision", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const processId = String(req.params.id);
  const parsed = z.object({ decision: z.enum(["accept", "reject", "istikharah"]) }).safeParse(req.body);
  if (!parsed.success || !z.string().uuid().safeParse(processId).success) {
    return void res.status(400).json({ error: { code: "INVALID_DECISION", message: "Keputusan tidak valid." } });
  }
  try {
    const result = await decideProposal(session.user.id, processId, parsed.data.decision, "sop-taaruf-1.0");
    res.json({ data: result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "DECISION_FAILED";
    const message = code === "GUARDIAN_NOT_VERIFIED"
      ? "Wali belum terverifikasi. Hubungi admin agar wali dapat dikonfirmasi sebelum melanjutkan."
      : "Keputusan tidak dapat diproses atau statusnya sudah berubah.";
    res.status(409).json({ error: { code, message } });
  }
}));

app.post("/api/processes/:id/guardian-decision", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const processId = String(req.params.id);
  const parsed = z.object({ decision: z.enum(["accept", "reject"]) }).safeParse(req.body);
  if (!parsed.success || !z.string().uuid().safeParse(processId).success) {
    return void res.status(400).json({ error: { code: "INVALID_GUARDIAN_DECISION", message: "Keputusan wali tidak valid." } });
  }
  try {
    const result = await decideGuardian(session.user.id, processId, parsed.data.decision, "sop-taaruf-1.0");
    res.json({ data: result });
  } catch {
    res.status(409).json({ error: { code: "INVALID_GUARDIAN_DECISION", message: "Keputusan wali tidak dapat diproses atau statusnya sudah berubah." } });
  }
}));

app.post("/api/processes/:id/withdraw", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const processId = String(req.params.id);
  const parsed = z.object({
    reason: z.enum(["Tidak menemukan kecocokan", "Keluarga atau wali belum menyetujui", "Belum siap melanjutkan", "Ada informasi baru", "Alasan pribadi", "Merasa tidak aman"]),
  }).safeParse(req.body);
  if (!parsed.success || !z.string().uuid().safeParse(processId).success) {
    return void res.status(400).json({ error: { code: "INVALID_WITHDRAWAL", message: "Alasan penutupan proses tidak valid." } });
  }
  try {
    const result = await withdrawProcess(session.user.id, processId, parsed.data.reason);
    res.json({ data: result });
  } catch {
    res.status(409).json({ error: { code: "INVALID_WITHDRAWAL", message: "Proses tidak dapat ditutup atau statusnya sudah berubah." } });
  }
}));

function resolveProfileSectionStatuses(rows: Array<{ key: string; status: string; answers: unknown; encryptedAnswers: string | null }>, role: string) {
  return rows.map((row) => {
    const definition = profileFormSections.find((item) => item.key === row.key);
    if (!definition || ["profile", "identity"].includes(row.key)) return { key: row.key, status: row.status };
    let answers = (row.answers ?? {}) as Record<string, unknown>;
    if (row.encryptedAnswers) {
      try { answers = decryptJson<Record<string, unknown>>(row.encryptedAnswers); } catch { answers = {}; }
    }
    const applicableFields = definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(role as "participant_male" | "participant_female"));
    const hasRequiredAnswers = applicableFields.every((field) => {
      if (field.required === false) return true;
      const answer = String(answers[field.name] ?? "").trim();
      return Boolean(answer) && (field.type !== "textarea" || answer.length >= 10);
    });
    return { key: row.key, status: row.status === "complete" && hasRequiredAnswers ? "complete" : "draft" };
  });
}

app.get("/api/dashboard/summary", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const isParticipant = session.user.role.startsWith("participant_");
  const participantSections = isParticipant ? await db.select({ key: profileSections.key, status: profileSections.status, answers: profileSections.answers, encryptedAnswers: profileSections.encryptedAnswers }).from(profileSections).where(eq(profileSections.userId, session.user.id)) : [];
  const currentSectionStatuses = resolveProfileSectionStatuses(participantSections, session.user.role);
  const completionPercent = isParticipant ? Math.round((requiredProfileSectionKeys.filter((key) => currentSectionStatuses.some((row) => row.key === key && row.status === "complete")).length / requiredProfileSectionKeys.length) * 100) : 0;
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
      completionPercent,
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
  res.json({ data: resolveProfileSectionStatuses(rows, session.user.role) });
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
  fullName: z.string().trim().min(3).max(120), gender: z.enum(["Ikhwan", "Akhwat"]), birthDate: z.coerce.date(), birthPlace: z.string().trim().min(2).max(100), phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/), province: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80), district: z.string().trim().min(2).max(80), village: z.string().trim().min(2).max(80), originCity: z.string().trim().min(2).max(100), maritalStatus: z.string().min(1).max(60), marriageForm: z.string().min(1).max(100), occupation: z.string().trim().min(3).max(500), workplace: z.string().trim().max(160).optional(), salaryRange: z.string().min(1).max(80), educationLevel: z.string().min(1).max(80), manhaj: z.string().trim().min(2).max(120), ethnicity: z.string().trim().min(2).max(80), quranReading: z.string().min(1).max(80), quranMemorization: z.string().min(1).max(80), prayer: z.string().min(1).max(120), studyFrequency: z.string().min(1).max(80), music: z.string().min(1).max(80), smoking: z.string().min(1).max(40), widowMarriage: z.string().min(1).max(40), heightCm: z.coerce.number().int().min(120).max(230).optional(), weightKg: z.coerce.number().int().min(30).max(250).optional(),
});

function ageRangeFrom(value: string) {
  const ages = value.match(/\d{2}/g)?.map(Number).filter((age) => age >= 18 && age <= 80) ?? [];
  return {
    minAge: ages[0] ?? 18,
    maxAge: ages[1] ?? ages[0] ?? 80,
  };
}

async function syncMatchingProjection(userId: string, section: string, answers: Record<string, string>) {
  if (section === "physical") {
    const heightCm = Number.parseInt(answers.heightCm ?? "", 10);
    const weightKg = Number.parseInt(answers.weightKg ?? "", 10);
    await db.update(profiles).set({
      heightCm: Number.isFinite(heightCm) ? heightCm : null,
      weightKg: Number.isFinite(weightKg) ? weightKg : null,
      bodyShape: answers.bodyShape || null,
      skinTone: answers.skinTone || null,
      updatedAt: new Date(),
    }).where(eq(profiles.userId, userId));
    return;
  }
  if (section === "marriage") {
    const targetMonths = answers.timeline === "Kurang dari 3 bulan" ? 3
      : answers.timeline === "3–6 bulan" ? 6
        : answers.timeline === "6–12 bulan" ? 12
          : answers.timeline === "Lebih dari 1 tahun" ? 18
            : null;
    await db.update(profiles).set({ marriageTargetMonths: targetMonths, updatedAt: new Date() }).where(eq(profiles.userId, userId));
    return;
  }
  if (section !== "criteria_nonphysical" && section !== "criteria_physical") return;

  const [current] = await db.select().from(partnerPreferences).where(eq(partnerPreferences.userId, userId)).limit(1);
  const existingCriteria = (current?.criteria ?? {}) as Record<string, unknown>;
  const safeKeys = section === "criteria_nonphysical"
    ? ["ethnicity", "occupation", "incomeExpectation", "domicile", "mahrExpectation", "maintenanceExpectation", "currentResidenceExpectation", "smokingCriteria"]
    : ["bodyShape", "heightRange", "skinTone", "hairType"];
  const projected = Object.fromEntries(safeKeys.filter((key) => answers[key]).map((key) => [key, answers[key]]));
  const criteria = { ...existingCriteria, [section]: projected };
  const ages = section === "criteria_nonphysical" ? ageRangeFrom(answers.age ?? "") : {
    minAge: current?.minAge ?? 18,
    maxAge: current?.maxAge ?? 80,
  };
  const values = {
    userId,
    minAge: ages.minAge,
    maxAge: ages.maxAge,
    provinces: section === "criteria_nonphysical" && answers.domicile ? [answers.domicile] : (current?.provinces ?? []),
    educationLevels: section === "criteria_nonphysical" && answers.education ? [answers.education] : (current?.educationLevels ?? []),
    maritalStatuses: section === "criteria_nonphysical" && answers.maritalStatus ? [answers.maritalStatus] : (current?.maritalStatuses ?? []),
    criteria,
    updatedAt: new Date(),
  };
  await db.insert(partnerPreferences).values(values).onConflictDoUpdate({
    target: partnerPreferences.userId,
    set: values,
  });
}

app.put("/api/profile/core", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!session.user.role.startsWith("participant_")) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  const parsed = profileCoreSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: { code: "INVALID_PROFILE", message: "Semua field wajib diisi dengan format yang benar." } });
  const value = parsed.data;
  await db.update(users).set({ phone: value.phone, updatedAt: new Date() }).where(eq(users.id, session.user.id));
  const completionPercent = Math.round(100 / requiredProfileSectionKeys.length);
  await db.insert(profiles).values({ userId: session.user.id, birthDate: value.birthDate, province: value.province, city: value.city, originCity: value.originCity, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, educationLevel: value.educationLevel, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent }).onConflictDoUpdate({ target: profiles.userId, set: { birthDate: value.birthDate, province: value.province, city: value.city, originCity: value.originCity, ethnicity: value.ethnicity, maritalStatus: value.maritalStatus, educationLevel: value.educationLevel, manhaj: value.manhaj, heightCm: value.heightCm, weightKg: value.weightKg, occupationField: value.occupation, completionPercent, updatedAt: new Date() } });
  const protectedIdentity = encryptJson(value);
  await db.insert(profileSections).values({ userId: session.user.id, key: "profile", status: "complete", answers: { fullNameProtected: true, gender: value.gender }, encryptedAnswers: protectedIdentity }).onConflictDoUpdate({ target: [profileSections.userId, profileSections.key], set: { status: "complete", answers: { fullNameProtected: true, gender: value.gender }, encryptedAnswers: protectedIdentity, updatedAt: new Date() } });
  await db.insert(auditLogs).values({ actorId: session.user.id, action: "profile.section.saved", targetType: "profile_section", targetId: "profile", metadata: { section: "profile" } });
  res.json({ data: { ok: true } });
}));

app.put("/api/profile/sections/:section/draft", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  if (!session.user.role.startsWith("participant_")) return void res.status(403).json({ error: { code: "FORBIDDEN", message: "Akses ditolak." } });
  const definition = profileFormSections.find((item) => item.key === req.params.section);
  if (!definition || ["profile", "identity"].includes(definition.key)) return void res.status(404).json({ error: { code: "UNKNOWN_SECTION", message: "Bagian biodata tidak ditemukan." } });
  const applicableFields = definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(session.user.role as "participant_male" | "participant_female"));
  const answers = Object.fromEntries(applicableFields.map((field) => [field.name, String(req.body?.[field.name] ?? "").trim()]));
  const sensitive = sensitiveSectionKeys.has(definition.key) || applicableFields.some((field) => field.sensitive);
  await db.insert(profileSections).values({
    userId: session.user.id,
    key: definition.key,
    status: "partial",
    answers: sensitive ? { protected: true } : answers,
    encryptedAnswers: sensitive ? encryptJson(answers) : null,
  }).onConflictDoUpdate({
    target: [profileSections.userId, profileSections.key],
    set: {
      status: "partial",
      answers: sensitive ? { protected: true } : answers,
      encryptedAnswers: sensitive ? encryptJson(answers) : null,
      updatedAt: new Date(),
    },
  });
  res.json({ data: { ok: true, status: "draft" } });
}));

app.put("/api/profile/sections/:section", asyncRoute(async (req, res) => {
  const session = await requireUser(req, res);
  if (!session) return;
  const definition = profileFormSections.find((item) => item.key === req.params.section);
  if (!definition || ["profile", "identity"].includes(definition.key)) return void res.status(404).json({ error: { code: "UNKNOWN_SECTION", message: "Bagian biodata tidak ditemukan." } });
  const applicableFields = definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(session.user.role as "participant_male" | "participant_female"));
  const answers = Object.fromEntries(applicableFields.map((field) => [field.name, String(req.body?.[field.name] ?? "").trim()]));
  const invalidRequiredAnswer = applicableFields.some((field) => field.required !== false && (!answers[field.name] || (field.type === "textarea" && answers[field.name].length < 10)));
  if (invalidRequiredAnswer) return void res.status(400).json({ error: { code: "INCOMPLETE_SECTION", message: "Lengkapi semua pertanyaan wajib. Jawaban uraian minimal 10 karakter." } });
  const sensitive = sensitiveSectionKeys.has(definition.key) || applicableFields.some((field) => field.sensitive);
  await db.insert(profileSections).values({ userId: session.user.id, key: definition.key, status: "complete", answers: sensitive ? { protected: true } : answers, encryptedAnswers: sensitive ? encryptJson(answers) : null }).onConflictDoUpdate({ target: [profileSections.userId, profileSections.key], set: { status: "complete", answers: sensitive ? { protected: true } : answers, encryptedAnswers: sensitive ? encryptJson(answers) : null, updatedAt: new Date() } });
  await syncMatchingProjection(session.user.id, definition.key, answers);
  const [completed] = await db.select({ value: count() }).from(profileSections).where(and(eq(profileSections.userId, session.user.id), eq(profileSections.status, "complete"), inArray(profileSections.key, [...requiredProfileSectionKeys])));
  const completionPercent = Math.min(100, Math.round((completed.value / requiredProfileSectionKeys.length) * 100));
  await db.insert(profiles).values({ userId: session.user.id, completionPercent }).onConflictDoUpdate({ target: profiles.userId, set: { completionPercent, updatedAt: new Date() } });
  if (completionPercent === 100) {
    await db.update(users).set({ status: "active_search", updatedAt: new Date() }).where(and(
      eq(users.id, session.user.id),
      inArray(users.status, ["profile_incomplete", "pending_identity", "under_review", "self_inactive"]),
    ));
    await refreshRecommendationsForParticipant(session.user.id);
  }
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
