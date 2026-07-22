import { describe, expect, it } from "vitest";
import { scoreMatch } from "./matching";

const preference = {
  minAge: 24,
  maxAge: 32,
  provinces: ["Jawa Barat"],
  educationLevels: ["S1"],
  requiredManhaj: "Salaf",
  targetMarriageMaxMonths: 12,
  familyVision: ["pendidikan agama", "tinggal mandiri"],
  lifestyle: ["tanpa rokok", "olahraga"],
};

describe("scoreMatch", () => {
  it("menolak kandidat yang gagal hard filter", () => {
    const result = scoreMatch(
      {
        age: 35,
        province: "Jawa Barat",
        educationLevel: "S1",
        manhaj: "Salaf",
      },
      preference,
    );
    expect(result.eligible).toBe(false);
    expect(result.hardFailures).toContain("usia");
  });
  it("memberi skor dan alasan transparan tanpa data sensitif", () => {
    const result = scoreMatch(
      {
        age: 28,
        province: "Jawa Barat",
        educationLevel: "S1",
        manhaj: "Salaf",
        marriageTargetMonths: 12,
        familyVision: preference.familyVision,
        lifestyle: preference.lifestyle,
      },
      preference,
    );
    expect(result.eligible).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.reasons).toHaveLength(4);
  });
});
