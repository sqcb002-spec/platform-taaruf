"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { navForRole, type NavItem } from "@/lib/dashboard-config";
import { roleLabels, type AppRole } from "@/lib/roles";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const nav = navForRole(user.role);
  const primaryMobile = nav.slice(0, 4);
  const remainingMobile = nav.slice(4);

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
    <div className="portal-shell">
      {/* Hallmark N9: quiet edge alignment keeps the member portal personal, not enterprise-like. */}
      <header className="portal-header">
        <Link href="/dashboard" className="portal-wordmark" aria-label="Ta’aruf Sunnah — beranda peserta">
          <span aria-hidden="true">ت</span>
          <strong>Ta’aruf Sunnah</strong>
        </Link>
        <div className="portal-header-actions">
          <Link href="/dashboard/notifikasi" className="portal-icon-button" prefetch={false} aria-label="Buka notifikasi">
            <Bell aria-hidden="true" />
          </Link>
          <details className="portal-profile">
            <summary>
              <span>{user.name.slice(0, 2).toUpperCase()}</span>
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

      {menuOpen ? <button className="portal-sheet-backdrop" onClick={() => setMenuOpen(false)} aria-label="Tutup menu lainnya" /> : null}
      <aside className={`portal-mobile-sheet ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
        <header><strong>Menu lainnya</strong><button onClick={() => setMenuOpen(false)} aria-label="Tutup menu"><X /></button></header>
        <nav aria-label="Menu peserta lainnya">
          {remainingMobile.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} prefetch={false} onClick={() => setMenuOpen(false)} className={isActive(pathname, item.href) ? "active" : ""}><Icon /><span>{item.label}</span></Link>;
          })}
        </nav>
      </aside>

      <nav className="portal-bottom-nav" aria-label="Navigasi utama perangkat seluler">
        {primaryMobile.map((item) => <MobileItem key={item.href} item={item} pathname={pathname} />)}
        <button onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} className={menuOpen ? "active" : ""}><Menu /><span>Menu</span></button>
      </nav>
    </div>
  );
}
