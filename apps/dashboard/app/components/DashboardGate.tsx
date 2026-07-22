"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DashboardShell } from "@/app/components/DashboardShell";
import { ParticipantShell } from "@/app/components/ParticipantShell";
import type { AppRole } from "@/lib/roles";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace(`/masuk?lanjut=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending) return <div className="dashboard-gate"><LoaderCircle className="spin" /><strong>Menyiapkan ruang amanah…</strong><span>Memeriksa sesi dan hak akses Anda</span></div>;
  if (!session || error) return <div className="dashboard-gate"><LoaderCircle className="spin" /><strong>Mengarahkan ke halaman masuk…</strong></div>;
  const user = session.user as typeof session.user & { role: AppRole; displayCode: string };
  const shellUser = { name: user.name, email: user.email, displayCode: user.displayCode, role: user.role };
  const usesParticipantPortal = user.role?.startsWith("participant_") || user.role === "guardian";
  return usesParticipantPortal
    ? <ParticipantShell user={shellUser}>{children}</ParticipantShell>
    : <DashboardShell user={shellUser}>{children}</DashboardShell>;
}
