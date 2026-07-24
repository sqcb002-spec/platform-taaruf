import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import {
  accounts,
  auditLogs,
  partnerPreferences,
  profileSections,
  profiles,
  users,
} from "@/db/schema";
import { encryptJson } from "@/lib/crypto";
import {
  profileFormSections,
  sensitiveSectionKeys,
  type ProfileField,
} from "@/lib/profile-form";

type ParticipantRole = "participant_male" | "participant_female";

type TestParticipant = {
  number: number;
  role: ParticipantRole;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  province: string;
  city: string;
  district: string;
  village: string;
  originCity: string;
  ethnicity: string;
  occupation: string;
  workplace: string;
  education: string;
  height: number;
  weight: number;
  skinTone: string;
  bodyShape: string;
};

const shared = {
  maritalStatus: "Belum menikah",
  manhaj: "Ahlus Sunnah",
  education: "S1",
};

const participants: TestParticipant[] = [
  { number: 1, role: "participant_male", name: "Ahmad Fauzan", email: "test.ikhwan01@platformtaarufsunnah.my.id", password: "TaarufTest#Ikhwan01", birthDate: "1996-03-12", province: "DKI Jakarta", city: "Kota Administrasi Jakarta Selatan", district: "Jagakarsa", village: "Tanjung Barat", originCity: "Jakarta", ethnicity: "Betawi", occupation: "Software Engineer", workplace: "Perusahaan teknologi", education: "S1", height: 172, weight: 67, skinTone: "Sawo matang", bodyShape: "Normal" },
  { number: 2, role: "participant_male", name: "Bilal Ramadhan", email: "test.ikhwan02@platformtaarufsunnah.my.id", password: "TaarufTest#Ikhwan02", birthDate: "1994-08-21", province: "Jawa Barat", city: "Kota Bandung", district: "Coblong", village: "Dago", originCity: "Bandung", ethnicity: "Sunda", occupation: "Analis Keuangan", workplace: "Perusahaan jasa keuangan", education: "S1", height: 169, weight: 63, skinTone: "Kuning langsat", bodyShape: "Normal" },
  { number: 3, role: "participant_male", name: "Farhan Akbar", email: "test.ikhwan03@platformtaarufsunnah.my.id", password: "TaarufTest#Ikhwan03", birthDate: "1992-11-05", province: "DI Yogyakarta", city: "Kabupaten Sleman", district: "Depok", village: "Caturtunggal", originCity: "Yogyakarta", ethnicity: "Jawa", occupation: "Wirausaha Kuliner", workplace: "Usaha mandiri", education: "Diploma", height: 175, weight: 72, skinTone: "Sawo matang", bodyShape: "Normal" },
  { number: 4, role: "participant_male", name: "Hasan Muttaqin", email: "test.ikhwan04@platformtaarufsunnah.my.id", password: "TaarufTest#Ikhwan04", birthDate: "1997-01-18", province: "Banten", city: "Kota Tangerang Selatan", district: "Pamulang", village: "Pamulang Barat", originCity: "Serang", ethnicity: "Sunda", occupation: "Guru", workplace: "Sekolah swasta", education: "S1", height: 168, weight: 60, skinTone: "Cokelat", bodyShape: "Kurus" },
  { number: 5, role: "participant_male", name: "Yusuf Pratama", email: "test.ikhwan05@platformtaarufsunnah.my.id", password: "TaarufTest#Ikhwan05", birthDate: "1993-06-29", province: "Jawa Timur", city: "Kota Surabaya", district: "Wonokromo", village: "Darmo", originCity: "Surabaya", ethnicity: "Jawa", occupation: "Arsitek", workplace: "Konsultan arsitektur", education: "S1", height: 177, weight: 74, skinTone: "Sawo matang", bodyShape: "Normal" },
  { number: 1, role: "participant_female", name: "Aisyah Rahma", email: "test.akhwat01@platformtaarufsunnah.my.id", password: "TaarufTest#Akhwat01", birthDate: "1998-04-14", province: "Jawa Barat", city: "Kota Bogor", district: "Bogor Tengah", village: "Babakan", originCity: "Bogor", ethnicity: "Sunda", occupation: "Apoteker", workplace: "Klinik kesehatan", education: "S1", height: 158, weight: 50, skinTone: "Kuning langsat", bodyShape: "Normal" },
  { number: 2, role: "participant_female", name: "Hana Nabila", email: "test.akhwat02@platformtaarufsunnah.my.id", password: "TaarufTest#Akhwat02", birthDate: "1997-09-02", province: "DKI Jakarta", city: "Kota Administrasi Jakarta Timur", district: "Ciracas", village: "Kelapa Dua Wetan", originCity: "Bekasi", ethnicity: "Jawa", occupation: "Content Writer", workplace: "Perusahaan pendidikan", education: "S1", height: 155, weight: 48, skinTone: "Putih", bodyShape: "Kurus" },
  { number: 3, role: "participant_female", name: "Maryam Zahra", email: "test.akhwat03@platformtaarufsunnah.my.id", password: "TaarufTest#Akhwat03", birthDate: "1995-12-10", province: "Jawa Tengah", city: "Kota Semarang", district: "Banyumanik", village: "Sumurboto", originCity: "Semarang", ethnicity: "Jawa", occupation: "Dokter Umum", workplace: "Rumah sakit swasta", education: "S1", height: 160, weight: 53, skinTone: "Sawo matang", bodyShape: "Normal" },
  { number: 4, role: "participant_female", name: "Salma Khairunnisa", email: "test.akhwat04@platformtaarufsunnah.my.id", password: "TaarufTest#Akhwat04", birthDate: "1999-02-26", province: "Banten", city: "Kota Tangerang", district: "Cipondoh", village: "Cipondoh Indah", originCity: "Tangerang", ethnicity: "Betawi", occupation: "Guru PAUD", workplace: "Sekolah Islam", education: "S1", height: 157, weight: 52, skinTone: "Kuning langsat", bodyShape: "Normal" },
  { number: 5, role: "participant_female", name: "Nadia Humaira", email: "test.akhwat05@platformtaarufsunnah.my.id", password: "TaarufTest#Akhwat05", birthDate: "1996-07-17", province: "Jawa Timur", city: "Kota Malang", district: "Lowokwaru", village: "Tulusrejo", originCity: "Malang", ethnicity: "Jawa", occupation: "Desainer Produk", workplace: "Studio desain", education: "S1", height: 162, weight: 55, skinTone: "Sawo matang", bodyShape: "Normal" },
];

const prose: Record<string, string> = {
  marriageIntention: "Menikah untuk menjaga agama, membangun keluarga yang tenang, dan bertumbuh dalam kebaikan.",
  vision: "Membangun rumah tangga yang berlandaskan tauhid, musyawarah, kasih sayang, dan tanggung jawab.",
  mission: "Menjaga ibadah bersama, berkomunikasi terbuka, serta mendidik keluarga dengan ilmu yang benar.",
  familyRelationship: "Hubungan dengan keluarga baik, terbuka, dan tetap menjaga batas keputusan rumah tangga.",
  futureDomicile: "Mengutamakan tempat tinggal mandiri di Jabodetabek dan terbuka bermusyawarah bila perlu pindah.",
  religionCriteria: "Menjaga tauhid, shalat wajib, adab, dan memiliki kemauan untuk terus belajar agama.",
  characterCriteria: "Jujur, tenang, bertanggung jawab, dapat bermusyawarah, dan menghormati keluarga.",
  nonNegotiables: "Kejujuran, komitmen pada pernikahan, tidak melakukan kekerasan, dan menjaga shalat wajib.",
  blaming: "Mendengar penjelasan terlebih dahulu, menegur dengan baik, lalu mencari perbaikan bersama.",
  conflict: "Memberi jeda bila emosi tinggi, melanjutkan musyawarah, dan melibatkan mediator bila diperlukan.",
  differentOpinion: "Mendengarkan alasan masing-masing dan mencari keputusan yang paling maslahat melalui musyawarah.",
  whereIsAllah: "Allah berada di atas ‘Arsy sesuai dengan kebesaran-Nya, sebagaimana dipahami dari dalil yang dipelajari.",
  tawhid: "Meniadakan seluruh sesembahan yang batil dan menetapkan ibadah hanya kepada Allah.",
  lifeTarget: "Menjadi pribadi yang bermanfaat, menjaga keluarga, dan terus bertumbuh dalam ilmu serta amal.",
  characterSummary: "Tenang, bertanggung jawab, mudah diajak berdiskusi, dan membutuhkan waktu untuk benar-benar terbuka.",
  positiveTraits: "Disiplin, dapat dipercaya, dan berusaha menyelesaikan amanah sampai tuntas.",
  negativeTraits: "Terkadang terlalu fokus pada detail dan sedang belajar lebih fleksibel dalam berkomunikasi.",
};

function defaultAnswer(field: ProfileField, participant: TestParticipant) {
  const roleOptions = field.optionsFor?.[participant.role];
  if (roleOptions?.length) return roleOptions[0];
  if (field.options?.length) return field.options[0];
  if (field.name === "heightCm") return String(participant.height);
  if (field.name === "weightKg") return String(participant.weight);
  if (field.name === "bodyShape") return participant.bodyShape;
  if (field.name === "skinTone") return participant.skinTone;
  if (field.name === "fatherName") return "Bapak Data Uji";
  if (field.name === "motherName") return "Ibu Data Uji";
  if (field.name === "fatherOccupation") return "Wiraswasta";
  if (field.name === "motherOccupation") return "Ibu Rumah Tangga";
  if (field.name.endsWith("Religion")) return "Islam";
  if (field.name === "childOrder") return "2";
  if (field.name === "siblingCount") return "3";
  if (field.name === "age") return participant.role === "participant_male" ? "23–30 tahun" : "27–36 tahun";
  if (field.name === "domicile") return "Jabodetabek dan kota besar di Pulau Jawa";
  if (field.name === "education") return "Minimal SMA/sederajat; kesiapan belajar lebih utama";
  if (field.name.startsWith("reference")) return `Referensi ${field.name.at(-1)} Data Uji, teman keluarga, 08000000000${field.name.at(-1)}, mengenal 5 tahun`;
  if (field.name in prose) return prose[field.name];
  if (field.type === "number") return "1";
  if (field.type === "date") return "2026-01-01";
  if (field.required === false) return "";
  return `Jawaban simulasi ${field.label.toLowerCase()} untuk pengujian alur platform.`;
}

function coreAnswers(participant: TestParticipant) {
  return {
    fullName: `[DATA TEST] ${participant.name}`,
    gender: participant.role === "participant_male" ? "Ikhwan" : "Akhwat",
    birthDate: participant.birthDate,
    birthPlace: participant.originCity,
    phone: `62800000${participant.role === "participant_male" ? "1" : "2"}${String(participant.number).padStart(3, "0")}`,
    province: participant.province,
    city: participant.city,
    district: participant.district,
    village: participant.village,
    originCity: participant.originCity,
    maritalStatus: shared.maritalStatus,
    marriageForm: "Monogami / satu pasangan",
    occupation: participant.occupation,
    workplace: participant.workplace,
    salaryRange: "Akan disampaikan saat proses ta’aruf",
    educationLevel: participant.education,
    manhaj: shared.manhaj,
    ethnicity: participant.ethnicity,
    quranReading: "Baik dan terus belajar",
    quranMemorization: "Juz 30",
    prayer: "Menjaga shalat lima waktu",
    studyFrequency: "1–2 kali per minggu",
    music: "Menghindari musik",
    smoking: "Tidak",
    widowMarriage: participant.role === "participant_male" ? "Dapat dipertimbangkan" : "Dapat dipertimbangkan",
    heightCm: participant.height,
    weightKg: participant.weight,
  };
}

async function seedParticipant(participant: TestParticipant) {
  const email = participant.email.toLowerCase();
  const displayCode = `TEST-${participant.role === "participant_male" ? "IKH" : "AKH"}-${String(participant.number).padStart(3, "0")}`;
  let [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const created = !existingUser;
  const userId = existingUser?.id ?? randomUUID();
  const now = new Date();

  if (existingUser) {
    await db.update(users).set({
      name: `[TEST] ${participant.name}`,
      emailVerified: true,
      role: participant.role,
      displayCode,
      status: "active_search",
      phone: coreAnswers(participant).phone,
      updatedAt: now,
    }).where(eq(users.id, userId));
  } else {
    await db.insert(users).values({
      id: userId,
      name: `[TEST] ${participant.name}`,
      email,
      emailVerified: true,
      role: participant.role,
      displayCode,
      status: "active_search",
      phone: coreAnswers(participant).phone,
    });
    existingUser = { id: userId };
  }

  const password = await hashPassword(participant.password);
  const [credential] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.providerId, "credential"))).limit(1);
  if (credential) {
    await db.update(accounts).set({ password, updatedAt: now }).where(eq(accounts.id, credential.id));
  } else {
    await db.insert(accounts).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password,
    });
  }

  const core = coreAnswers(participant);
  await db.insert(profiles).values({
    userId,
    birthDate: new Date(participant.birthDate),
    province: participant.province,
    city: participant.city,
    originCity: participant.originCity,
    ethnicity: participant.ethnicity,
    maritalStatus: shared.maritalStatus,
    educationLevel: participant.education,
    occupationField: participant.occupation,
    manhaj: shared.manhaj,
    marriageTargetMonths: 6,
    heightCm: participant.height,
    weightKg: participant.weight,
    bodyShape: participant.bodyShape,
    skinTone: participant.skinTone,
    completionPercent: 100,
    publishedAt: now,
  }).onConflictDoUpdate({
    target: profiles.userId,
    set: {
      birthDate: new Date(participant.birthDate),
      province: participant.province,
      city: participant.city,
      originCity: participant.originCity,
      ethnicity: participant.ethnicity,
      maritalStatus: shared.maritalStatus,
      educationLevel: participant.education,
      occupationField: participant.occupation,
      manhaj: shared.manhaj,
      marriageTargetMonths: 6,
      heightCm: participant.height,
      weightKg: participant.weight,
      bodyShape: participant.bodyShape,
      skinTone: participant.skinTone,
      completionPercent: 100,
      publishedAt: now,
      updatedAt: now,
    },
  });

  await db.insert(profileSections).values({
    userId,
    key: "profile",
    status: "complete",
    answers: { fullNameProtected: true, gender: core.gender, testData: true },
    encryptedAnswers: encryptJson(core),
  }).onConflictDoUpdate({
    target: [profileSections.userId, profileSections.key],
    set: {
      status: "complete",
      answers: { fullNameProtected: true, gender: core.gender, testData: true },
      encryptedAnswers: encryptJson(core),
      updatedAt: now,
    },
  });

  for (const section of profileFormSections.filter((item) => !["profile", "identity"].includes(item.key))) {
    const applicableFields = section.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(participant.role));
    const answers = Object.fromEntries(applicableFields.map((field) => [field.name, defaultAnswer(field, participant)]));
    const sensitive = sensitiveSectionKeys.has(section.key) || applicableFields.some((field) => field.sensitive);
    await db.insert(profileSections).values({
      userId,
      key: section.key,
      status: "complete",
      answers: sensitive ? { protected: true, testData: true } : { ...answers, testData: true },
      encryptedAnswers: sensitive ? encryptJson(answers) : null,
    }).onConflictDoUpdate({
      target: [profileSections.userId, profileSections.key],
      set: {
        status: "complete",
        answers: sensitive ? { protected: true, testData: true } : { ...answers, testData: true },
        encryptedAnswers: sensitive ? encryptJson(answers) : null,
        updatedAt: now,
      },
    });
  }

  await db.insert(partnerPreferences).values({
    userId,
    minAge: participant.role === "participant_male" ? 23 : 27,
    maxAge: participant.role === "participant_male" ? 30 : 36,
    provinces: ["DKI Jakarta", "Jawa Barat", "Banten"],
    educationLevels: ["SMA/SMK", "Diploma", "S1"],
    maritalStatuses: ["Belum menikah"],
    criteria: { testData: true, note: "Preferensi simulasi untuk pengujian internal." },
  }).onConflictDoUpdate({
    target: partnerPreferences.userId,
    set: {
      minAge: participant.role === "participant_male" ? 23 : 27,
      maxAge: participant.role === "participant_male" ? 30 : 36,
      provinces: ["DKI Jakarta", "Jawa Barat", "Banten"],
      educationLevels: ["SMA/SMK", "Diploma", "S1"],
      maritalStatuses: ["Belum menikah"],
      criteria: { testData: true, note: "Preferensi simulasi untuk pengujian internal." },
      updatedAt: now,
    },
  });

  if (created) {
    await db.insert(auditLogs).values({
      action: "test_participant.seeded",
      targetType: "user",
      targetId: userId,
      metadata: { displayCode, role: participant.role, source: "seed-test-participants" },
    });
  }

  return displayCode;
}

async function main() {
  const codes: string[] = [];
  for (const participant of participants) codes.push(await seedParticipant(participant));
  process.stdout.write(`Seed data test selesai: ${codes.join(", ")}.\n`);
}

main().catch((error) => {
  process.stderr.write(`Seed data test gagal: ${error instanceof Error ? error.message : "UNKNOWN_ERROR"}\n`);
  process.exitCode = 1;
});
