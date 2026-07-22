"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const now = window.scrollY;
      setCompact(now > 64 && now > last);
      last = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`site-nav ${compact ? "is-compact" : ""} ${dismissed ? "is-dismissed" : ""}`}
    >
      {!dismissed && (
        <div className="notice-bar">
          <span>Himbauan</span>
          <p>
            Ta’aruf adalah ikhtiar menuju pernikahan, bukan ruang interaksi
            tanpa batas.
          </p>
          <a href="#himbauan">Baca panduan</a>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Tutup himbauan"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="nav-bar">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark">ت</span>
          <span>
            Ta’aruf <b>Sunnah</b>
          </span>
        </Link>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#proses">Cara kerja</a>
          <a href="#prinsip">Prinsip</a>
          <a href="#bantuan">Bantuan</a>
        </nav>
        <div className="nav-actions">
          <Link href={`${dashboardUrl}/masuk`} className="nav-login">
            Masuk
          </Link>
          <Link href={`${dashboardUrl}/daftar`} className="btn btn-sm">
            Daftar
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Buka menu"
          >
            <Menu size={21} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu">
          <a onClick={() => setOpen(false)} href="#tentang">
            Tentang platform
          </a>
          <a onClick={() => setOpen(false)} href="#proses">
            Cara kerja
          </a>
          <a onClick={() => setOpen(false)} href="#prinsip">
            Prinsip & privasi
          </a>
          <a onClick={() => setOpen(false)} href="#bantuan">
            Bantuan
          </a>
          <Link href={`${dashboardUrl}/masuk`}>Masuk ke akun →</Link>
        </nav>
      )}
    </header>
  );
}
