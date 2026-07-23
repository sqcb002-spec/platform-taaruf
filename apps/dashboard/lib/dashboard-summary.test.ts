import { describe, expect, it } from "vitest";
import { navigationBadge, type DashboardSummary } from "./dashboard-summary";

const summary: DashboardSummary = {
  user: {
    id: "user-1",
    name: "Admin",
    role: "super_admin",
    displayCode: "TS-ADMIN",
  },
  completionPercent: 0,
  stats: {
    verificationQueue: 0,
    activeProcesses: 0,
    unreadNotifications: 0,
    openCases: 0,
    totalParticipants: 0,
    overdueProcesses: 0,
  },
  recentActivity: [],
};

describe("dashboard navigation indicators", () => {
  it("does not display badges when the database reports zero", () => {
    expect(navigationBadge("/dashboard/verifikasi", summary)).toBeNull();
    expect(navigationBadge("/dashboard/notifikasi", summary)).toBeNull();
  });

  it("displays values returned by the dashboard summary", () => {
    const populated = {
      ...summary,
      stats: { ...summary.stats, verificationQueue: 3, unreadNotifications: 2 },
    };
    expect(navigationBadge("/dashboard/verifikasi", populated)).toBe("3");
    expect(navigationBadge("/dashboard/notifikasi", populated)).toBe("2");
  });
});
