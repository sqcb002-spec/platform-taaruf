"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, House, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app.render.failed", error);
  }, [error]);

  return (
    <main className="app-error-page">
      <section className="dashboard-error-state" role="alert">
        <span className="dashboard-error-icon">
          <AlertTriangle />
        </span>
        <p className="mono">GANGGUAN SEMENTARA</p>
        <h1>Halaman belum berhasil dimuat.</h1>
        <p>
          Data Anda tetap aman. Coba lagi sesaat, atau kembali ke halaman utama
          jika gangguan berlanjut.
        </p>
        <div>
          <button type="button" className="app-primary" onClick={reset}>
            <RotateCcw /> Coba lagi
          </button>
          <Link href="/" className="app-secondary">
            <House /> Halaman utama
          </Link>
        </div>
        {error.digest ? <small>Kode kejadian: {error.digest}</small> : null}
      </section>
    </main>
  );
}
