"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, BookOpen, ChevronDown, CircleUserRound, HeartHandshake, Home, LoaderCircle, LogOut, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { navForRole, type NavItem } from "@/lib/dashboard-config";
import { navigationBadge, useDashboardSummary } from "@/lib/dashboard-summary";
import { roleLabels, type AppRole } from "@/lib/roles";
import { apiFetch, apiUrl } from "@/lib/api-client";

type PortalUser = {
  name: string;
  email: string;
  displayCode: string;
  role: AppRole;
};

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function MobileItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} prefetch={false} className={isActive(pathname, item.href) ? "active" : ""}>
      <Icon aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

export function ParticipantShell({ user, children }: { user: PortalUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const nav = navForRole(user.role);
  const summary = useDashboardSummary();
  const [onboarding, setOnboarding] = useState<{ loaded: boolean; complete: boolean; next: string }>({ loaded: !user.role.startsWith("participant_"), complete: !user.role.startsWith("participant_"), next: "profile" });
  const mobileNav: NavItem[] = [
    { label: "Beranda", href: "/dashboard", icon: Home },
    { label: "Biodata", href: "/dashboard/biodata", icon: CircleUserRound },
    { label: "Jodoh", href: "/dashboard/rekomendasi", icon: HeartHandshake },
    { label: "Proses", href: "/dashboard/proses", icon: Activity },
    { label: "Akun", href: "/dashboard/pengaturan", icon: Settings },
  ];
  const [avatarUrl, setAvatarUrl] = useState(`/avatars/${user.role === "participant_female" ? "pp_akhwat" : "pp_ikhwan"}.png`);

  useEffect(() => {
    fetch(`${apiUrl}/api/public/avatar-config`).then((response) => response.ok ? response.json() : null).then((body) => {
      const configured = body?.data?.[user.role];
      if (configured) setAvatarUrl(configured);
    }).catch(() => undefined);
  }, [user.role]);

  useEffect(() => {
    if (!user.role.startsWith("participant_")) return;
    const controller = new AbortController();
    apiFetch<Array<{ key: string; status: string }>>("/api/profile/sections", { signal: controller.signal })
      .then((rows) => {
        const done = new Set(rows.filter((row) => row.status === "complete").map((row) => row.key));
        const next = !done.has("profile") ? "profile" : !done.has("physical") ? "physical" : "family";
        setOnboarding({ loaded: true, complete: ["profile", "physical", "family"].every((key) => done.has(key)), next });
      })
      .catch((reason) => {
        if (reason?.name !== "AbortError") setOnboarding({ loaded: true, complete: false, next: "profile" });
      });
    return () => controller.abort();
  }, [pathname, user.role]);

  useEffect(() => {
    if (!onboarding.loaded || onboarding.complete || !user.role.startsWith("participant_")) return;
    const allowedDuringOnboarding = pathname.startsWith("/dashboard/biodata") || pathname.startsWith("/dashboard/panduan") || pathname.startsWith("/dashboard/pengaturan");
    if (!allowedDuringOnboarding) router.replace(`/dashboard/biodata?bagian=${onboarding.next}`);
  }, [onboarding, pathname, router, user.role]);

  async function signOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  if (!onboarding.loaded) return <div className="dashboard-gate"><LoaderCircle className="spin" /><strong>Menyiapkan tahap Anda…</strong></div>;

  const participantTheme = user.role === "participant_female" ? "participant-theme-female" : user.role === "participant_male" ? "participant-theme-male" : "";
  const focusMode = user.role.startsWith("participant_") && !onboarding.complete;

  if (focusMode) return (
    <div className={`portal-shell onboarding-focus-shell ${participantTheme}`}>
      <header className="onboarding-focus-header">
        <Link href={`/dashboard/biodata?bagian=${onboarding.next}`} className="portal-wordmark" aria-label="Ta’aruf Sunnah">
          <span aria-hidden="true">ت</span><strong>Ta’aruf Sunnah</strong>
        </Link>
        <div>
          <Link href="/dashboard/panduan" prefetch={false}><BookOpen /> Panduan</Link>
          <button onClick={signOut} disabled={signingOut}>{signingOut ? <LoaderCircle className="spin" /> : <LogOut />}<span>Keluar</span></button>
        </div>
      </header>
      <main className="onboarding-focus-content">{children}</main>
    </div>
  );

  return (
    <div className={`portal-shell ${participantTheme}`}>
      {/* Hallmark N9: quiet edge alignment keeps the member portal personal, not enterprise-like. */}
      <header className="portal-header">
        <Link href="/dashboard" className="portal-wordmark" aria-label="Ta’aruf Sunnah — beranda peserta">
          <span aria-hidden="true">ت</span>
          <strong>Ta’aruf Sunnah</strong>
        </Link>
        <div className="portal-header-actions">
          <Link href="/dashboard/notifikasi" className="portal-icon-button" prefetch={false} aria-label="Buka notifikasi">
            <Bell aria-hidden="true" />
            {summary && summary.stats.unreadNotifications > 0 ? <span className="portal-notification-dot" /> : null}
          </Link>
          <details className="portal-profile">
            <summary>
              <img className="portal-avatar" src={avatarUrl} alt={user.role === "participant_female" ? "Avatar default akhwat" : "Avatar default ikhwan"} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = `/avatars/${user.role === "participant_female" ? "pp_akhwat" : "pp_ikhwan"}.png`; }} />
              <span className="portal-profile-copy"><strong>{user.name}</strong><small>{user.displayCode}</small></span>
              <ChevronDown aria-hidden="true" />
            </summary>
            <div className="portal-profile-menu">
              <p>{roleLabels[user.role]}</p>
              <small>{user.email}</small>
              <Link href="/dashboard/pengaturan" prefetch={false}>Pengaturan akun</Link>
              <button onClick={signOut} disabled={signingOut} aria-busy={signingOut}>
                {signingOut ? <LoaderCircle className="spin" /> : <LogOut />}
                {signingOut ? "Mengakhiri sesi…" : "Keluar"}
              </button>
            </div>
          </details>
        </div>
      </header>

      <nav className="portal-nav" aria-label="Navigasi ruang peserta">
        {nav.map(({ href, label }) => (
          <Link key={href} href={href} prefetch={false} className={isActive(pathname, href) ? "active" : ""}>
            {label}
            {navigationBadge(href, summary) ? <small>{navigationBadge(href, summary)}</small> : null}
          </Link>
        ))}
      </nav>

      <main className="portal-content">{children}</main>

      <footer className="portal-footer">
        <div>
          <strong>Ta’aruf Sunnah</strong>
          <p>Ikhtiar yang dijaga dengan batas, persetujuan, dan pendampingan.</p>
        </div>
        <nav aria-label="Tautan bantuan">
          <Link href="/dashboard/panduan" prefetch={false}>Panduan</Link>
          <Link href="/dashboard/pengaturan" prefetch={false}>Privasi</Link>
        </nav>
        <small>Ruang peserta · {user.displayCode}</small>
      </footer>

      <nav className="portal-bottom-nav" aria-label="Navigasi utama perangkat seluler">
        {mobileNav.map((item) => <MobileItem key={item.href} item={item} pathname={pathname} />)}
      </nav>
    </div>
  );
}
