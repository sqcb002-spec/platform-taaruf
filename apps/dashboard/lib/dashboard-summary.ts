"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-client";
import type { AppRole } from "./roles";

export type DashboardSummary = {
  user: {
    id: string;
    name: string;
    role: AppRole;
    displayCode: string;
  };
  completionPercent: number;
  stats: {
    verificationQueue: number;
    activeProcesses: number;
    unreadNotifications: number;
    openCases: number;
    totalParticipants: number;
    overdueProcesses: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    targetType: string;
    createdAt: string;
  }>;
};

export function useDashboardSummary(refreshKey = "") {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener("taaruf:profile-updated", refresh);
    return () => window.removeEventListener("taaruf:profile-updated", refresh);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<DashboardSummary>("/api/dashboard/summary", {
      signal: controller.signal,
    }).then(setSummary).catch(() => setSummary(null));
    return () => controller.abort();
  }, [refreshKey, revision]);

  return summary;
}

export function navigationBadge(
  href: string,
  summary: DashboardSummary | null,
) {
  if (!summary) return null;
  if (href === "/dashboard/verifikasi" && summary.stats.verificationQueue > 0) {
    return String(summary.stats.verificationQueue);
  }
  if (href === "/dashboard/notifikasi" && summary.stats.unreadNotifications > 0) {
    return String(summary.stats.unreadNotifications);
  }
  if (
    href === "/dashboard/biodata" &&
    summary.user.role.startsWith("participant_") &&
    summary.completionPercent > 0
  ) {
    return `${summary.completionPercent}%`;
  }
  return null;
}
