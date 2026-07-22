export type MatchProfile = {
  age: number;
  province?: string | null;
  educationLevel?: string | null;
  manhaj?: string | null;
  marriageTargetMonths?: number | null;
  familyVision?: string[];
  lifestyle?: string[];
};

export type MatchPreference = {
  minAge: number;
  maxAge: number;
  provinces: string[];
  educationLevels: string[];
  requiredManhaj?: string;
  targetMarriageMaxMonths?: number;
  familyVision?: string[];
  lifestyle?: string[];
};

function overlap(left: string[] = [], right: string[] = []) {
  if (!left.length || !right.length) return 0.5;
  const target = new Set(right.map((item) => item.toLowerCase()));
  return (
    left.filter((item) => target.has(item.toLowerCase())).length /
    Math.max(left.length, right.length)
  );
}

export function scoreMatch(profile: MatchProfile, preference: MatchPreference) {
  const hardFailures: string[] = [];
  if (profile.age < preference.minAge || profile.age > preference.maxAge)
    hardFailures.push("usia");
  if (
    preference.provinces.length &&
    (!profile.province || !preference.provinces.includes(profile.province))
  )
    hardFailures.push("domisili");
  if (
    preference.educationLevels.length &&
    (!profile.educationLevel ||
      !preference.educationLevels.includes(profile.educationLevel))
  )
    hardFailures.push("pendidikan");
  if (
    preference.requiredManhaj &&
    profile.manhaj?.toLowerCase() !== preference.requiredManhaj.toLowerCase()
  )
    hardFailures.push("manhaj");
  if (hardFailures.length)
    return { eligible: false, score: 0, reasons: [], hardFailures };

  const religion = profile.manhaj && preference.requiredManhaj ? 30 : 22;
  const readiness =
    preference.targetMarriageMaxMonths && profile.marriageTargetMonths
      ? Math.max(
          0,
          20 -
            Math.abs(
              preference.targetMarriageMaxMonths - profile.marriageTargetMonths,
            ) *
              1.5,
        )
      : 12;
  const domicile = preference.provinces.length ? 15 : 10;
  const family = overlap(profile.familyVision, preference.familyVision) * 15;
  const ageCenter = (preference.minAge + preference.maxAge) / 2;
  const age = Math.max(4, 10 - Math.abs(profile.age - ageCenter));
  const education = preference.educationLevels.length ? 5 : 3;
  const lifestyle = overlap(profile.lifestyle, preference.lifestyle) * 5;
  const score = Math.round(
    Math.min(
      100,
      religion + readiness + domicile + family + age + education + lifestyle,
    ),
  );
  const reasons = [
    religion >= 25
      ? "Arah pemahaman agama selaras"
      : "Data agama dapat ditinjau",
    readiness >= 15
      ? "Target waktu menikah berdekatan"
      : "Kesiapan perlu dibahas",
    domicile === 15
      ? "Domisili sesuai kriteria"
      : "Domisili bersifat fleksibel",
    family >= 10
      ? "Visi keluarga memiliki banyak kesamaan"
      : "Visi keluarga perlu didalami",
  ];
  return { eligible: true, score, reasons, hardFailures };
}
