import { describe, expect, it } from "vitest";
import { navForRole } from "./dashboard-config";
import { roleLabels, type AppRole } from "./roles";

const roles = Object.keys(roleLabels) as AppRole[];

describe("dashboard navigation", () => {
  it.each(roles)("builds unique internal routes for %s", (role) => {
    const nav = navForRole(role);
    const hrefs = nav.map((item) => item.href);

    expect(hrefs[0]).toBe("/dashboard");
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.every((href) => href.startsWith("/dashboard"))).toBe(true);
  });

  it.each(["participant_male", "participant_female"] as const)(
    "gives %s access to the biodata workflow",
    (role) => {
      expect(navForRole(role).some(({ href }) => href === "/dashboard/biodata"))
        .toBe(true);
    },
  );
});
