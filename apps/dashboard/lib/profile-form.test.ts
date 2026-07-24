import { describe, expect, it } from "vitest";
import { profileFormSections } from "./profile-form";

function fieldNames(sectionKey: string) {
  return profileFormSections
    .find((section) => section.key === sectionKey)
    ?.fields.map((field) => field.name) ?? [];
}

describe("profile form coverage", () => {
  it("keeps the expanded family and worship details available", () => {
    expect(fieldNames("family_details")).toEqual(expect.arrayContaining([
      "fatherAge",
      "fatherEducation",
      "motherAge",
      "motherEducation",
      "olderBrothersDetail",
      "olderSistersDetail",
      "youngerSiblingsDetail",
    ]));
    expect(fieldNames("religion")).toEqual(expect.arrayContaining([
      "quranRoutine",
      "studiesAttended",
      "umrahStatus",
      "hajjStatus",
      "congregationalPrayer",
      "tahajjud",
      "witr",
      "duha",
      "sadaqah",
      "zakat",
      "waqf",
      "infaq",
    ]));
  });

  it("keeps structured partner criteria for matching", () => {
    expect(fieldNames("criteria_nonphysical")).toEqual(expect.arrayContaining([
      "age",
      "maritalStatus",
      "education",
      "ethnicity",
      "occupation",
      "incomeExpectation",
      "mahrExpectation",
      "maintenanceExpectation",
      "domicile",
      "currentResidenceExpectation",
    ]));
  });

  it("keeps private disclosures out of physical matching fields", () => {
    const physical = profileFormSections.find((section) => section.key === "physical");
    expect(physical?.fields.find((field) => field.name === "medicalHistory")?.sensitive).toBe(true);
    expect(fieldNames("criteria_physical")).not.toContain("medicalHistory");
  });
});
