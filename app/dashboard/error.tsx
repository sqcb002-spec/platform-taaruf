"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, House, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("dashboard.render.failed", error);
  }, [error]);

  return (
    <section className="dashboard-error-state" role="alert">
      <span className="dashboard-error-icon">
        <AlertTriangle />
      </span>
      <p className="mono">GANGGUAN SEMENTARA</p>
      <h1>Ruang ini belum berhasil dimuat.</h1>
      <p>
        Data Anda tetap aman. Coba muat ulang ruang kerja tanpa mengirim ulang
        formulir apa pun.
      </p>
      <div>
        <button type="button" className="app-primary" onClick={reset}>
          <RotateCcw /> Coba lagi
        </button>
        <Link href="/dashboard" className="app-secondary" prefetch={false}>
          <House /> Kembali ke ringkasan
        </Link>
      </div>
      {error.digest ? <small>Kode kejadian: {error.digest}</small> : null}
    </section>
  );
}
