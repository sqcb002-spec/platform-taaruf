"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, profileSections, profiles } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { encryptJson } from "@/lib/crypto";
import { profileFormSections, sensitiveSectionKeys } from "@/lib/profile-form";

const profileCoreSchema = z.object({
  username: z.string().trim().min(3).max(40),
  gender: z.enum(["Ikhwan", "Akhwat"]),
  birthDate: z.coerce.date(),
  maritalStatus: z.string().min(1).max(60),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  manhaj: z.string().trim().min(2).max(120),
  ethnicity: z.string().trim().min(2).max(80),
  heightCm: z.coerce.number().int().min(120).max(230),
  weightKg: z.coerce.number().int().min(30).max(250),
  occupation: z.string().trim().min(3).max(500),
});

export async function saveProfileCore(formData: FormData) {
  const { user } = await requireSession();
  if (!user.role.startsWith("participant_")) throw new Error("FORBIDDEN");
  const parsed = profileCoreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    throw new Error("Semua field wajib diisi dengan format yang benar.");
  const value = parsed.data;
  await db
    .insert(profiles)
    .values({
      userId: user.id,
      birthDate: value.birthDate,
      province: value.province,
      city: value.city,
      ethnicity: value.ethnicity,
      maritalStatus: value.maritalStatus,
      manhaj: value.manhaj,
      heightCm: value.heightCm,
      weightKg: value.weightKg,
      occupationField: value.occupation,
      completionPercent: 6,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        birthDate: value.birthDate,
        province: value.province,
        city: value.city,
        ethnicity: value.ethnicity,
        maritalStatus: value.maritalStatus,
        manhaj: value.manhaj,
        heightCm: value.heightCm,
        weightKg: value.weightKg,
        occupationField: value.occupation,
        completionPercent: 6,
        updatedAt: new Date(),
      },
    });
  await db
    .insert(profileSections)
    .values({
      userId: user.id,
      key: "profile",
      status: "complete",
      answers: { username: value.username, gender: value.gender },
    })
    .onConflictDoUpdate({
      target: [profileSections.userId, profileSections.key],
      set: {
        status: "complete",
        answers: { username: value.username, gender: value.gender },
        updatedAt: new Date(),
      },
    });
  await db.insert(auditLogs).values({
    actorId: user.id,
    action: "profile.section.saved",
    targetType: "profile_section",
    targetId: "profile",
    metadata: { section: "profile" },
  });
  revalidatePath("/dashboard/biodata");
}

export async function saveProfileSection(formData: FormData) {
  const { user } = await requireSession();
  if (!user.role.startsWith("participant_")) throw new Error("FORBIDDEN");
  const sectionKey = String(formData.get("sectionKey") ?? "");
  const definition = profileFormSections.find(
    (section) => section.key === sectionKey,
  );
  if (!definition || ["profile", "identity"].includes(sectionKey))
    throw new Error("INVALID_SECTION");
  const answers = Object.fromEntries(
    definition.fields.map((field) => [
      field.name,
      String(formData.get(field.name) ?? "").trim(),
    ]),
  );
  if (Object.values(answers).some((answer) => answer.length < 1))
    throw new Error("Semua pertanyaan pada bagian ini wajib dijawab.");
  const sensitive =
    sensitiveSectionKeys.has(sectionKey) ||
    definition.fields.some((field) => field.sensitive);
  await db
    .insert(profileSections)
    .values({
      userId: user.id,
      key: sectionKey,
      status: "complete",
      answers: sensitive ? { protected: true } : answers,
      encryptedAnswers: sensitive ? encryptJson(answers) : null,
    })
    .onConflictDoUpdate({
      target: [profileSections.userId, profileSections.key],
      set: {
        status: "complete",
        answers: sensitive ? { protected: true } : answers,
        encryptedAnswers: sensitive ? encryptJson(answers) : null,
        updatedAt: new Date(),
      },
    });
  const [completed] = await db
    .select({ value: count() })
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, user.id),
        eq(profileSections.status, "complete"),
      ),
    );
  const completionPercent = Math.min(
    100,
    Math.round((completed.value / profileFormSections.length) * 100),
  );
  await db
    .insert(profiles)
    .values({ userId: user.id, completionPercent })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { completionPercent, updatedAt: new Date() },
    });
  await db
    .insert(auditLogs)
    .values({
      actorId: user.id,
      action: "profile.section.saved",
      targetType: "profile_section",
      targetId: sectionKey,
      metadata: { section: sectionKey, protected: sensitive },
    });
  revalidatePath("/dashboard/biodata");
}
