"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Check, ChevronRight, FileText, Filter, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import { navForRole, sectionCopy } from "@/lib/dashboard-config";
import { profileFormSections } from "@/lib/profile-form";
import type { AppRole } from "@/lib/roles";
import { DocumentUpload } from "@/app/components/DocumentUpload";

type SaveState = "idle" | "saving" | "saved" | "error";

function PrivacyNote() {
  return <div className="sensitive-note"><ShieldCheck /><div><strong>Visibilitas data dijaga bertahap</strong><p>Nama lengkap, kontak, dokumen identitas, dan jawaban sensitif hanya dipakai sesuai kewenangan dan tidak ditampilkan otomatis kepada kandidat.</p></div></div>;
}

function ProfileForm({ sectionKey, role, onSaved }: { sectionKey: string; role: AppRole; onSaved: () => void }) {
  const definition = profileFormSections.find((item) => item.key === sectionKey) ?? profileFormSections[0];
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiFetch(definition.key === "profile" ? "/api/profile/core" : `/api/profile/sections/${definition.key}`, { method: "PUT", body: JSON.stringify(values) });
      setState("saved");
      onSaved();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Bagian belum dapat disimpan.");
    }
  }

  if (definition.key === "identity") return <div className="profile-form"><div className="upload-grid"><DocumentUpload kind="identity_card" label="Foto KTP bagian depan" /><DocumentUpload kind="identity_selfie" label="Foto verifikasi diri bersama KTP" /><DocumentUpload kind="profile_photo" label="Foto peserta untuk verifikasi" /></div><PrivacyNote /></div>;

  const coreFields = [
    { name: "fullName", label: "Nama lengkap sesuai KTP" },
    { name: "birthDate", label: "Tanggal lahir", type: "date" },
    { name: "maritalStatus", label: "Status pernikahan" },
    { name: "province", label: "Provinsi" },
    { name: "city", label: "Kota/kabupaten" },
    { name: "manhaj", label: "Manhaj" },
    { name: "ethnicity", label: "Suku" },
    { name: "heightCm", label: "Tinggi badan (cm)", type: "number" },
    { name: "weightKg", label: "Berat badan (kg)", type: "number" },
    { name: "occupation", label: "Tempat dan bidang pekerjaan", type: "textarea" },
  ];
  const fields = definition.key === "profile" ? coreFields : definition.fields;

  return <form className="profile-form" onSubmit={submit}>
    {definition.key === "profile" ? <input type="hidden" name="gender" value={role === "participant_female" ? "Akhwat" : "Ikhwan"} /> : null}
    <div className="field-grid">{fields.map((field) => <label key={field.name}>{field.label}{field.type === "textarea" ? <textarea name={field.name} rows={4} required /> : <input name={field.name} type={field.type ?? "text"} min={field.name === "heightCm" ? 120 : field.name === "weightKg" ? 30 : undefined} max={field.name === "heightCm" ? 230 : field.name === "weightKg" ? 250 : undefined} required />}</label>)}</div>
    <PrivacyNote />
    {message ? <p className="form-error" role="alert">{message}</p> : null}
    {state === "saved" ? <p className="form-success">Bagian tersimpan dan progres telah diperbarui.</p> : null}
    <footer><Link href="/dashboard" className="app-secondary" prefetch={false}>Simpan nanti</Link><button className="app-primary" disabled={state === "saving"}>{state === "saving" ? <><LoaderCircle className="spin" /> Menyimpan…</> : <>Simpan bagian <ChevronRight /></>}</button></footer>
  </form>;
}

function QueueModule({ section }: { section: string }) {
  return <section className="queue-card"><div className="queue-tools"><div className="queue-search"><Search /><input placeholder="Cari kode atau status…" /></div><button><Filter /> Filter</button></div><div className="data-table"><div className="data-row data-head"><span>Kode / proses</span><span>Status</span><span>Informasi utama</span><span>Tenggat</span><span /></div><div className="empty-queue"><Search /><h3>Belum ada data pada ruang ini.</h3><p>{section === "rekomendasi" ? "Rekomendasi muncul setelah seluruh biodata dan verifikasi disetujui." : "Item baru akan muncul otomatis ketika membutuhkan tindakan Anda."}</p></div></div></section>;
}

export default function DashboardSectionPage() {
  const { section } = useParams<{ section: string }>();
  const query = useSearchParams();
  const { data: session } = authClient.useSession();
  const user = session?.user as ({ id: string; name: string; email: string; role: AppRole }) | undefined;
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(section === "biodata");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const selectedKey = query.get("bagian") ?? "profile";

  useEffect(() => {
    if (section !== "biodata") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiFetch<Array<{ key: string; status: string }>>("/api/profile/sections", { signal: controller.signal })
      .then((rows) => setCompleted(new Set(rows.filter((row) => row.status === "complete").map((row) => row.key))))
      .catch((reason) => { if (reason?.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Progres belum dapat dimuat."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reload, section]);

  const allowed = useMemo(() => user ? navForRole(user.role).some((item) => item.href === `/dashboard/${section}`) : true, [section, user]);
  if (!allowed) return <section className="dashboard-error"><ShieldCheck /><h1>Ruang ini bukan bagian dari amanah Anda.</h1><Link className="app-primary" href="/dashboard">Kembali ke dashboard</Link></section>;
  const copy = sectionCopy[section] ?? { eyebrow: "RUANG KERJA", title: section.replaceAll("-", " "), body: "Kelola informasi dan tindakan yang menjadi kewenangan Anda pada ruang ini." };
  const definition = profileFormSections.find((item) => item.key === selectedKey) ?? profileFormSections[0];
  const percent = Math.round((completed.size / profileFormSections.length) * 100);

  return <>
    <header className="module-heading"><div><p className="mono">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p></div><Link href="/dashboard/panduan" className="app-secondary" prefetch={false}><FileText /> Lihat panduan</Link></header>
    {section !== "biodata" ? <QueueModule section={section} /> : loading ? <section className="dashboard-loading"><div className="skeleton skeleton-panel" /><p><LoaderCircle className="spin" /> Memuat progres biodata…</p></section> : error ? <section className="dashboard-error"><ShieldCheck /><h2>Progres biodata belum dapat dimuat.</h2><p>{error}</p><button className="app-primary" onClick={() => setReload((value) => value + 1)}><RefreshCw /> Coba lagi</button></section> : <div className="biodata-layout"><aside className="section-progress"><div><strong>{percent}%</strong><span>{completed.size} dari {profileFormSections.length} bagian</span></div>{profileFormSections.map((item, index) => <Link key={item.key} href={`/dashboard/biodata?bagian=${item.key}`} prefetch={false} className={`${item.key === definition.key ? "current" : ""} ${completed.has(item.key) ? "complete" : ""}`}><span>{completed.has(item.key) ? <Check /> : index + 1}</span>{item.label}<ChevronRight /></Link>)}</aside><section className="form-card"><header><div><p className="mono">BAGIAN {String(profileFormSections.indexOf(definition) + 1).padStart(2, "0")}</p><h2>{definition.label}</h2><p>{definition.description}</p></div><span className="autosave"><span /> Data privat</span></header>{user ? <ProfileForm sectionKey={definition.key} role={user.role} onSaved={() => setReload((value) => value + 1)} /> : <div className="dashboard-loading"><LoaderCircle className="spin" /></div>}</section></div>}
  </>;
}
