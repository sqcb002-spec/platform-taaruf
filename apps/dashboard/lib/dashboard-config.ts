import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  CircleUserRound,
  ClipboardCheck,
  FileCheck2,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { AppRole } from "./roles";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const common: NavItem[] = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell },
  { label: "Panduan", href: "/dashboard/panduan", icon: BookOpen },
  { label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
];

const participant: NavItem[] = [
  {
    label: "Biodata",
    href: "/dashboard/biodata",
    icon: CircleUserRound,
  },
  { label: "Rekomendasi", href: "/dashboard/rekomendasi", icon: Search },
  { label: "Pengajuan", href: "/dashboard/pengajuan", icon: HeartHandshake },
  { label: "Proses Ta’aruf", href: "/dashboard/proses", icon: Activity },
  { label: "Inbox Terarah", href: "/dashboard/inbox", icon: Inbox },
];
const guardian: NavItem[] = [
  { label: "Akhwat Terhubung", href: "/dashboard/amanah", icon: Users },
  {
    label: "Permintaan Persetujuan",
    href: "/dashboard/persetujuan",
    icon: ClipboardCheck,
  },
  { label: "Jadwal Nazhor", href: "/dashboard/nazhor", icon: CalendarDays },
  { label: "Riwayat Keputusan", href: "/dashboard/riwayat", icon: Activity },
];
const mediator: NavItem[] = [
  {
    label: "Proses Ditugaskan",
    href: "/dashboard/penugasan",
    icon: ListChecks,
  },
  { label: "Dialog Terarah", href: "/dashboard/dialog", icon: Inbox },
  {
    label: "Pemeriksaan Referensi",
    href: "/dashboard/referensi",
    icon: FileCheck2,
  },
  { label: "Jadwal Nazhor", href: "/dashboard/nazhor", icon: CalendarDays },
];
const admin: NavItem[] = [
  {
    label: "Antrean Verifikasi",
    href: "/dashboard/verifikasi",
    icon: ClipboardCheck,
  },
  { label: "Data Peserta", href: "/dashboard/peserta", icon: Users },
  { label: "Kurasi Kandidat", href: "/dashboard/kurasi", icon: Search },
  { label: "Proses Aktif", href: "/dashboard/proses", icon: Activity },
  {
    label: "Laporan & Banding",
    href: "/dashboard/moderasi",
    icon: ShieldAlert,
  },
  { label: "Dukungan", href: "/dashboard/dukungan", icon: Inbox },
];
const superAdmin: NavItem[] = [
  ...admin,
  { label: "Pengguna Internal", href: "/dashboard/staf", icon: Users },
  { label: "SOP & Kebijakan", href: "/dashboard/kebijakan", icon: FileCheck2 },
  {
    label: "Konfigurasi Sistem",
    href: "/dashboard/konfigurasi",
    icon: SlidersHorizontal,
  },
  { label: "Audit Sistem", href: "/dashboard/audit", icon: ShieldAlert },
];

export function navForRole(role: AppRole): NavItem[] {
  const specific = role.startsWith("participant_")
    ? participant
    : role === "guardian"
      ? guardian
      : role === "mediator"
        ? mediator
        : role === "super_admin"
          ? superAdmin
          : admin;
  return [common[0], ...specific, ...common.slice(1)];
}

export const sectionCopy: Record<
  string,
  { eyebrow: string; title: string; body: string }
> = {
  biodata: {
    eyebrow: "PROFIL BERTAHAP",
    title: "Lengkapi biodata dengan jujur dan tenang.",
    body: "Setiap bagian disimpan otomatis, ditinjau sesuai kewenangan, dan hanya dibuka mengikuti tahap proses.",
  },
  rekomendasi: {
    eyebrow: "KANDIDAT TERBATAS",
    title: "Rekomendasi yang relevan, bukan etalase peserta.",
    body: "Kandidat telah melewati syarat wajib. Skor ditampilkan bersama alasan yang dapat dipahami.",
  },
  pengajuan: {
    eyebrow: "DUAL CONSENT",
    title: "Pengajuan dan keputusan tanpa tekanan.",
    body: "Pengajuan tidak membuka komunikasi. Ta’aruf aktif hanya setelah kedua peserta dan wali akhwat menyetujui.",
  },
  proses: {
    eyebrow: "SATU PROSES AKTIF",
    title: "Satu perjalanan, satu fokus.",
    body: "Pantau dialog, pemeriksaan referensi, nazhor, khitbah, hingga penyelesaian proses dalam satu timeline.",
  },
  inbox: {
    eyebrow: "KOMUNIKASI RESMI",
    title: "Pembahasan terarah dan terdampingi.",
    body: "Inbox bukan chat bebas. Pertanyaan, jawaban, dan arahan mediator tersusun berdasarkan tujuan pernikahan.",
  },
  verifikasi: {
    eyebrow: "ANTREAN AMANAH",
    title: "Tinjau data yang memang menjadi kewenangan Anda.",
    body: "Setiap keputusan verifikasi membutuhkan catatan dan menghasilkan jejak audit.",
  },
  peserta: {
    eyebrow: "PESERTA TERKELOLA",
    title: "Data peserta berdasarkan wilayah kerja dan gender.",
    body: "Gunakan pencarian kode peserta dan status; data sensitif tetap tertutup sampai alasan akses terpenuhi.",
  },
  kurasi: {
    eyebrow: "COLD-START QUEUE",
    title: "Kurasi kandidat tanpa melanggar syarat wajib.",
    body: "Admin hanya dapat menawarkan peserta yang lolos hard filter dan tidak sedang menjalani proses aktif.",
  },
  penugasan: {
    eyebrow: "AMANAH MEDIATOR",
    title: "Proses yang membutuhkan pendampingan Anda.",
    body: "Prioritas disusun berdasarkan tenggat, tahap, dan tindakan yang belum selesai.",
  },
  persetujuan: {
    eyebrow: "PERSETUJUAN WALI",
    title: "Keputusan terpisah, jelas, dan tercatat.",
    body: "Persetujuan wali tidak menggantikan keputusan akhwat dan hanya berlaku untuk calon serta versi SOP tertentu.",
  },
  panduan: {
    eyebrow: "PUSAT PANDUAN",
    title: "Pahami setiap tahap sebelum melangkah.",
    body: "Panduan ringkas tentang adab, privasi, persetujuan, dan alur ta’aruf yang menjadi dasar penggunaan platform.",
  },
  pengaturan: {
    eyebrow: "PENGATURAN AKUN",
    title: "Kelola akun dengan aman dan sadar.",
    body: "Atur keamanan, privasi, dan status akun Anda. Perubahan penting selalu tercatat dan mengikuti SOP platform.",
  },
};
