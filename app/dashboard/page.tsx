import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { requireSession } from "@/lib/session";
import { roleLabels } from "@/lib/roles";

const roleContent = {
  participant_male: {
    title: "Lengkapi bekal sebelum memilih.",
    body: "Biodata Anda belum siap ditinjau. Selesaikan bagian wajib dan verifikasi identitas untuk membuka rekomendasi.",
    action: "Lanjutkan biodata",
    href: "/dashboard/biodata",
    progress: 32,
  },
  participant_female: {
    title: "Lengkapi bekal dan hubungan wali.",
    body: "Biodata, identitas, tiga referensi, dan wali terverifikasi diperlukan sebelum menerima rekomendasi.",
    action: "Lanjutkan biodata",
    href: "/dashboard/biodata",
    progress: 32,
  },
  guardian: {
    title: "Belum ada keputusan yang mendesak.",
    body: "Saat permintaan persetujuan masuk, Anda akan melihat biodata calon dan versi SOP yang berlaku.",
    action: "Lihat amanah wali",
    href: "/dashboard/amanah",
    progress: 100,
  },
  mediator: {
    title: "Tiga proses membutuhkan perhatian.",
    body: "Urutan kerja disusun berdasarkan tenggat dan tindakan yang belum diselesaikan.",
    action: "Buka penugasan",
    href: "/dashboard/penugasan",
    progress: 74,
  },
  admin_male: {
    title: "Antrean verifikasi ikhwan tersedia.",
    body: "Tinjau identitas, kesesuaian biodata, dan catatan OCR berdasarkan waktu masuk.",
    action: "Buka antrean",
    href: "/dashboard/verifikasi",
    progress: 68,
  },
  admin_female: {
    title: "Antrean verifikasi akhwat tersedia.",
    body: "Tinjau identitas, hubungan wali, dan kelengkapan biodata berdasarkan waktu masuk.",
    action: "Buka antrean",
    href: "/dashboard/verifikasi",
    progress: 68,
  },
  super_admin: {
    title: "Operasional platform dalam kendali.",
    body: "Pantau antrean, kebijakan aktif, worker dokumen, dan kejadian yang membutuhkan review kedua.",
    action: "Lihat audit sistem",
    href: "/dashboard/audit",
    progress: 91,
  },
} as const;

export default async function DashboardPage() {
  const { user } = await requireSession();
  const content = roleContent[user.role];
  const isParticipant = user.role.startsWith("participant_");
  return (
    <>
      <section className="dashboard-welcome">
        <div>
          <p className="mono">
            {roleLabels[user.role].toUpperCase()} · {user.displayCode}
          </p>
          <h1>Assalamu’alaikum, {user.name}.</h1>
          <p>
            Berikut keadaan proses dan amanah yang perlu Anda perhatikan hari
            ini.
          </p>
        </div>
        <div className="today">
          <CalendarDays />
          <span>Hari ini</span>
          <strong>
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </strong>
        </div>
      </section>
      <section className="focus-panel">
        <div className="focus-copy">
          <span className="status-chip">
            <Clock3 /> Tindakan berikutnya
          </span>
          <h2>{content.title}</h2>
          <p>{content.body}</p>
          <Link href={content.href} className="app-primary">
            {content.action} <ArrowUpRight />
          </Link>
        </div>
        <div
          className="progress-orbit"
          style={
            {
              "--progress": `${content.progress * 3.6}deg`,
            } as React.CSSProperties
          }
        >
          <div>
            <strong>{content.progress}%</strong>
            <span>{isParticipant ? "Kelengkapan" : "Terselesaikan"}</span>
          </div>
        </div>
      </section>
      <section className="metric-grid">
        <article>
          <span>
            <FileText />
          </span>
          <div>
            <small>{isParticipant ? "Bagian biodata" : "Antrean utama"}</small>
            <strong>{isParticipant ? "6 dari 17" : "12"}</strong>
            <p>
              {isParticipant
                ? "11 bagian belum lengkap"
                : "4 melewati SLA hari ini"}
            </p>
          </div>
        </article>
        <article>
          <span>
            <HeartHandshake />
          </span>
          <div>
            <small>Proses aktif</small>
            <strong>{isParticipant ? "Belum ada" : "8 proses"}</strong>
            <p>Satu proses aktif per peserta</p>
          </div>
        </article>
        <article>
          <span>
            <ShieldCheck />
          </span>
          <div>
            <small>Status verifikasi</small>
            <strong>{isParticipant ? "Perlu dilengkapi" : "Terkendali"}</strong>
            <p>Setiap keputusan tercatat</p>
          </div>
        </article>
      </section>
      <div className="dashboard-columns">
        <section className="dashboard-card">
          <header>
            <div>
              <p className="mono">AKTIVITAS TERBARU</p>
              <h2>Jejak proses</h2>
            </div>
            <Link href="/dashboard/proses">Lihat semua</Link>
          </header>
          <div className="timeline-list">
            {[
              ["Akun berhasil dibuat", "Sistem", "Hari ini"],
              ["Email menunggu verifikasi", "Keamanan akun", "Hari ini"],
              ["Biodata utama dimulai", "Profil peserta", "Belum selesai"],
            ].map(([title, meta, time], index) => (
              <div key={title}>
                <span className={index === 0 ? "done" : ""}>
                  {index === 0 ? <CheckCircle2 /> : index + 1}
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{meta}</p>
                </div>
                <time>{time}</time>
              </div>
            ))}
          </div>
        </section>
        <aside className="dashboard-card guidance-card">
          <p className="mono">HIMBAUAN</p>
          <h2>Jaga tujuan setiap langkah.</h2>
          <p>
            Platform tidak membuka komunikasi pribadi. Gunakan ruang terarah dan
            libatkan wali serta mediator sesuai tahap.
          </p>
          <Link href="/dashboard/panduan">
            Baca adab proses <ArrowUpRight />
          </Link>
        </aside>
      </div>
    </>
  );
}
