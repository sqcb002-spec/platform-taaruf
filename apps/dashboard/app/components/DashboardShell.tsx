"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LoaderCircle, LogOut, Menu, Search, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { navForRole } from "@/lib/dashboard-config";
import { navigationBadge, useDashboardSummary } from "@/lib/dashboard-summary";
import { roleLabels, type AppRole } from "@/lib/roles";

export function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string; displayCode: string; role: AppRole };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const nav = navForRole(user.role);
  const summary = useDashboardSummary();

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

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" className="wordmark">
            <span className="wordmark-mark">ت</span>
            <span>
              Ta’aruf <b>Sunnah</b>
            </span>
          </Link>
          <button
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X />
          </button>
        </div>
        <div className="role-stamp">
          <span className="mono">RUANG AMANAH</span>
          <strong>{roleLabels[user.role]}</strong>
          <small>{user.displayCode}</small>
        </div>
        <nav className="app-nav" aria-label="Navigasi dashboard">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={active ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                <Icon />
                <span>{label}</span>
                {navigationBadge(href, summary) ? <small>{navigationBadge(href, summary)}</small> : null}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-help">
          <span className="mono">BUTUH BANTUAN?</span>
          <p>Hubungi admin sesuai peran Anda melalui menu dukungan resmi.</p>
          <Link href="/dashboard/panduan" prefetch={false}>
            Buka pusat panduan →
          </Link>
        </div>
        <button
          className="signout"
          onClick={signOut}
          disabled={signingOut}
          aria-busy={signingOut}
        >
          {signingOut ? <LoaderCircle className="spin" /> : <LogOut />}
          {signingOut ? "Mengakhiri sesi…" : "Keluar"}
        </button>
      </aside>
      {open ? (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Tutup menu"
        />
      ) : null}
      <div className="app-main">
        <header className="app-topbar">
          <button
            className="mobile-open"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            <Menu />
          </button>
          <div className="top-search">
            <Search />
            <span>Cari kode peserta atau bantuan…</span>
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <Link
              href="/dashboard/notifikasi"
              prefetch={false}
              aria-label="Notifikasi"
              className="notification-button"
            >
              <Bell />
              {summary && summary.stats.unreadNotifications > 0 ? <span /> : null}
            </Link>
            <button className="user-menu">
              <span>{user.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{user.name}</strong>
                <small>{roleLabels[user.role]}</small>
              </div>
              <ChevronDown />
            </button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
