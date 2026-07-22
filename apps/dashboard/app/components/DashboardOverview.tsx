"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FileText, HeartHandshake, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { roleLabels, type AppRole } from "@/lib/roles";

const roleContent = {
  participant_male: { title: "Lengkapi bekal sebelum memilih.", body: "Selesaikan biodata dan verifikasi identitas untuk membuka rekomendasi.", action: "Lanjutkan biodata", href: "/dashboard/biodata" },
  participant_female: { title: "Lengkapi bekal dan hubungan wali.", body: "Biodata, identitas, referensi, dan wali terverifikasi diperlukan sebelum menerima rekomendasi.", action: "Lanjutkan biodata", href: "/dashboard/biodata" },
  guardian: { title: "Belum ada keputusan yang mendesak.", body: "Permintaan persetujuan akan muncul bersama biodata calon dan SOP yang berlaku.", action: "Lihat amanah wali", href: "/dashboard/amanah" },
  mediator: { title: "Belum ada proses yang ditugaskan.", body: "Proses baru akan muncul berdasarkan penugasan dan tenggat operasional.", action: "Buka penugasan", href: "/dashboard/penugasan" },
  admin_male: { title: "Antrean verifikasi ikhwan.", body: "Tinjau identitas, biodata, dan catatan pemeriksaan berdasarkan waktu masuk.", action: "Buka antrean", href: "/dashboard/verifikasi" },
  admin_female: { title: "Antrean verifikasi akhwat.", body: "Tinjau identitas, hubungan wali, dan biodata berdasarkan waktu masuk.", action: "Buka antrean", href: "/dashboard/verifikasi" },
  super_admin: { title: "Operasional platform dalam kendali.", body: "Pantau antrean, kebijakan, worker, dan kejadian yang membutuhkan review kedua.", action: "Lihat audit sistem", href: "/dashboard/audit" },
} as const;

type Summary = { user: { id: string; name: string; role: AppRole; displayCode: string }; completionPercent: number };

export function DashboardOverview() {
  const { data: authSession } = authClient.useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    apiFetch<Summary>("/api/dashboard/summary", { signal: controller.signal })
      .then(setSummary)
      .catch((reason) => { if (reason?.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Data belum dapat dimuat."); });
    return () => controller.abort();
  }, [attempt]);

  if (!summary && !error) return <section className="dashboard-loading"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-panel" /><div className="metric-grid">{[1,2,3].map((item) => <div className="skeleton skeleton-metric" key={item} />)}</div><p><LoaderCircle className="spin" /> Mengambil ringkasan terbaru…</p></section>;
  if (!summary) return <section className="dashboard-error"><ShieldCheck /><h1>Ringkasan belum dapat dimuat.</h1><p>{error}</p><button className="app-primary" onClick={() => setAttempt((value) => value + 1)}><RefreshCw /> Coba lagi</button></section>;

  const role = summary.user.role;
  const content = roleContent[role];
  const isParticipant = role.startsWith("participant_");
  const progress = isParticipant ? summary.completionPercent : 0;
  const name = summary.user.name || authSession?.user.name || "Sahabat";
  return <>
    <section className="dashboard-welcome"><div><p className="mono">{roleLabels[role].toUpperCase()} · {summary.user.displayCode}</p><h1>Assalamu’alaikum, {name}.</h1><p>Berikut keadaan proses dan amanah yang perlu Anda perhatikan hari ini.</p></div><div className="today"><CalendarDays /><span>Hari ini</span><strong>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</strong></div></section>
    <section className="focus-panel"><div className="focus-copy"><span className="status-chip"><Clock3 /> Tindakan berikutnya</span><h2>{content.title}</h2><p>{content.body}</p><Link href={content.href} className="app-primary" prefetch={false}>{content.action} <ArrowUpRight /></Link></div><div className="progress-orbit" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div><strong>{progress}%</strong><span>{isParticipant ? "Kelengkapan" : "Terselesaikan"}</span></div></div></section>
    <section className="metric-grid"><article><span><FileText /></span><div><small>{isParticipant ? "Bagian biodata" : "Antrean utama"}</small><strong>{isParticipant ? `${Math.round((progress / 100) * 17)} dari 17` : "0"}</strong><p>{isParticipant ? `${17 - Math.round((progress / 100) * 17)} bagian belum lengkap` : "Tidak ada item melewati SLA"}</p></div></article><article><span><HeartHandshake /></span><div><small>Proses aktif</small><strong>{isParticipant ? "Belum ada" : "0 proses"}</strong><p>Satu proses aktif per peserta</p></div></article><article><span><ShieldCheck /></span><div><small>Status verifikasi</small><strong>{isParticipant ? "Perlu dilengkapi" : "Terkendali"}</strong><p>Setiap keputusan tercatat</p></div></article></section>
    <div className="dashboard-columns"><section className="dashboard-card"><header><div><p className="mono">AKTIVITAS TERBARU</p><h2>Jejak proses</h2></div><Link href="/dashboard/proses" prefetch={false}>Lihat semua</Link></header><div className="timeline-list">{[["Akun berhasil dibuat","Sistem","Tercatat"],["Email telah diverifikasi","Keamanan akun","Selesai"],["Biodata utama","Profil peserta",progress ? `${progress}%` : "Belum selesai"]].map(([title,meta,time], index) => <div key={title}><span className={index < 2 ? "done" : ""}>{index < 2 ? <CheckCircle2 /> : index + 1}</span><div><strong>{title}</strong><p>{meta}</p></div><time>{time}</time></div>)}</div></section><aside className="dashboard-card guidance-card"><p className="mono">HIMBAUAN</p><h2>Jaga tujuan setiap langkah.</h2><p>Platform tidak membuka komunikasi pribadi. Gunakan ruang terarah dan libatkan wali serta mediator sesuai tahap.</p><Link href="/dashboard/panduan" prefetch={false}>Baca adab proses <ArrowUpRight /></Link></aside></div>
  </>;
}
