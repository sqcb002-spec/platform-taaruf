"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowRight, BellRing, BookOpen, CalendarDays, Check, ChevronRight, EyeOff, FileText, Filter, LoaderCircle, LockKeyhole, LogOut, RefreshCw, Search, ShieldCheck, UserRoundCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, apiUrl } from "@/lib/api-client";
import { navForRole, sectionCopy } from "@/lib/dashboard-config";
import { profileFormSections } from "@/lib/profile-form";
import { roleLabels, type AppRole } from "@/lib/roles";
import { DocumentUpload } from "@/app/components/DocumentUpload";

type SaveState = "idle" | "saving" | "saved" | "error";

const onboardingGroups = [
  { key: "data-diri", label: "Data diri", description: "Identitas dasar yang paling penting untuk memulai.", sections: ["profile"] },
  { key: "fisik", label: "Fisik", description: "Gambaran fisik yang relevan dan secukupnya.", sections: ["physical"] },
  { key: "keluarga", label: "Keluarga", description: "Keluarga inti dan informasi yang berdampak pada pernikahan.", sections: ["family"] },
];

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

  const coreFields: Array<{ name: string; label: string; type?: "text" | "textarea" | "number" | "date" | "select"; options?: string[]; placeholder?: string }> = [
    { name: "fullName", label: "Nama lengkap sesuai KTP" }, { name: "birthDate", label: "Tanggal lahir", type: "date" }, { name: "phone", label: "No. HP/WhatsApp", placeholder: "Contoh: 6281234567890" },
    { name: "province", label: "Provinsi" }, { name: "city", label: "Kota/kabupaten" }, { name: "district", label: "Kecamatan" }, { name: "village", label: "Kelurahan/desa" },
    { name: "maritalStatus", label: "Status pernikahan", type: "select", options: ["Lajang", "Duda", "Janda"] }, { name: "occupation", label: "Pekerjaan", placeholder: "Contoh: Software Engineer" },
    { name: "salaryRange", label: "Gaji per bulan", type: "select", options: ["Di bawah Rp3 juta", "Rp3–5 juta", "Rp5–7 juta", "Rp7–10 juta", "Di atas Rp10 juta"] }, { name: "educationLevel", label: "Pendidikan terakhir", type: "select", options: ["SMP", "SMA/SMK", "Diploma", "Sarjana", "Pascasarjana"] },
    { name: "quranReading", label: "Kemampuan baca Al-Qur’an", type: "select", options: ["Belum lancar", "Cukup", "Fasih"] }, { name: "quranMemorization", label: "Hafalan Al-Qur’an", type: "select", options: ["Belum ada", "Juz 30", "1–3 juz", "4–7 juz", "8–10 juz", "Lebih dari 10 juz"] },
    { name: "prayer", label: "Shalat wajib", type: "select", options: ["Menjaga 5 waktu", "Kadang terlewat", "Sedang memperbaiki"] }, { name: "studyFrequency", label: "Kajian per minggu", type: "select", options: ["Belum rutin", "1 kali", "2–3 kali", "Lebih dari 3 kali"] },
    { name: "music", label: "Preferensi musik", type: "select", options: ["Tidak", "Ya, sesekali", "Ya, rutin"] }, { name: "smoking", label: "Merokok", type: "select", options: ["Tidak", "Ya"] }, { name: "widowMarriage", label: "Bersedia menikah dengan duda/janda", type: "select", options: ["Ya", "Tidak", "Akan dibahas bersama keluarga"] },
  ];
  const fields = definition.key === "profile" ? coreFields : definition.fields;
  const fieldGroups = definition.key === "profile" ? [
    { title: "Informasi dasar", fields: fields.slice(0, 8) },
    { title: "Pekerjaan & pendidikan", fields: fields.slice(8, 11) },
    { title: "Informasi keagamaan", fields: fields.slice(11, 15) },
    { title: "Preferensi pribadi", fields: fields.slice(15) },
  ].filter((group) => group.fields.length > 0) : [{ title: "", fields }];
  const placeholders: Record<string, string> = {
    fullName: "Contoh: Ahmad Fauzan",
    birthDate: "Pilih tanggal lahir",
    phone: "Contoh: 6281234567890",
    maritalStatus: "Contoh: Belum menikah",
    province: "Contoh: Jawa Barat",
    city: "Contoh: Kota Bandung",
    district: "Contoh: Kecamatan Coblong",
    village: "Contoh: Kelurahan Dago",
    manhaj: "Contoh: Ahlus Sunnah wal Jamaah",
    ethnicity: "Contoh: Sunda",
    heightCm: "Contoh: 170",
    weightKg: "Contoh: 65",
    occupation: "Contoh: Pengembang perangkat lunak di bidang teknologi",
    skinTone: "Contoh: Sawo matang",
    appearance: "Ceritakan gambaran fisik secara singkat dan wajar…",
    veil: "Contoh: Tidak bercadar / bercadar saat tertentu",
    isbal: "Contoh: Menjaga pakaian di atas mata kaki",
    beard: "Contoh: Memelihara janggut",
  };
  const placeholderFor = (name: string, type?: string) => placeholders[name] ?? (type === "textarea" ? "Tuliskan jawaban Anda secara ringkas…" : "Tulis jawaban Anda…");

  return <form className="profile-form" onSubmit={submit}>
    {definition.key === "profile" ? <input type="hidden" name="gender" value={role === "participant_female" ? "Akhwat" : "Ikhwan"} /> : null}
    <div className="profile-field-groups">{fieldGroups.map((group) => <section className="profile-field-group" key={group.title || definition.key}>{group.title ? <h3>{group.title}</h3> : null}<div className="field-grid">{group.fields.map((field) => { const id = `${definition.key}-${field.name}`; const placeholder = ("placeholder" in field ? field.placeholder : undefined) ?? placeholderFor(field.name, field.type); return <label key={field.name} htmlFor={id}><span>{field.label} <em>*</em></span>{field.type === "textarea" ? <textarea id={id} name={field.name} rows={4} required placeholder={placeholder} aria-describedby={`${id}-hint`} /> : field.type === "select" ? <select id={id} name={field.name} required defaultValue=""><option value="" disabled>{placeholder}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={id} name={field.name} type={field.type ?? "text"} min={field.name === "heightCm" ? 120 : field.name === "weightKg" ? 30 : undefined} max={field.name === "heightCm" ? 230 : field.name === "weightKg" ? 250 : undefined} required placeholder={placeholder} aria-describedby={`${id}-hint`} />}<small id={`${id}-hint`}>Wajib diisi agar tahap ini bisa disimpan.</small></label>; })}</div></section>)}</div>
    <PrivacyNote />
    {message ? <p className="form-error" role="alert">{message}</p> : null}
    {state === "saved" ? <p className="form-success">Bagian tersimpan dan progres telah diperbarui.</p> : null}
    <footer><Link href="/dashboard" className="app-secondary" prefetch={false}>Simpan nanti</Link><button className="app-primary" disabled={state === "saving"}>{state === "saving" ? <><LoaderCircle className="spin" /> Menyimpan…</> : <>Simpan bagian <ChevronRight /></>}</button></footer>
  </form>;
}

function OnboardingProgress({ activeGroup, completed, percent, selectedKey }: { activeGroup: typeof onboardingGroups[number]; completed: Set<string>; percent: number; selectedKey: string }) {
  return <div className="onboarding-progress">
    <div className="onboarding-progress-head"><div><p className="mono">BIODATA DIRI</p><h2>Mulai dari data diri.</h2></div><strong>{percent}%<small>selesai</small></strong></div>
    <div className="onboarding-steps">{onboardingGroups.map((group, index) => { const done = group.sections.every((key) => completed.has(key)); const unlocked = index === 0 || onboardingGroups[index - 1].sections.every((key) => completed.has(key)); const current = group.key === activeGroup.key; return <Link key={group.key} href={unlocked ? `/dashboard/biodata?bagian=${group.sections[0]}` : `/dashboard/biodata?bagian=${activeGroup.sections[0]}`} prefetch={false} onClick={(event) => { if (!unlocked) event.preventDefault(); }} aria-disabled={!unlocked} className={`onboarding-step ${current ? "current" : ""} ${done ? "complete" : ""} ${!unlocked ? "locked" : ""}`}><span>{done ? <Check /> : index + 1}</span><div><strong>{group.label}</strong><small>{done ? "Selesai" : current ? "Sedang diisi" : unlocked ? "Siap dimulai" : "Selesaikan tahap sebelumnya"}</small></div></Link>; })}</div>
    {activeGroup.sections.length > 1 ? <div className="onboarding-subnav"><span>Bagian tahap ini</span>{activeGroup.sections.map((key, index) => { const item = profileFormSections.find((entry) => entry.key === key); return <Link key={key} href={`/dashboard/biodata?bagian=${key}`} prefetch={false} className={item?.key === selectedKey ? "active" : ""}>{index + 1}. {item?.label ?? key}</Link>; })}</div> : null}
  </div>;
}

function QueueModule({ section }: { section: string }) {
  return <section className="queue-card"><div className="queue-tools"><div className="queue-search"><Search /><input placeholder="Cari kode atau status…" /></div><button><Filter /> Filter</button></div><div className="data-table"><div className="data-row data-head"><span>Kode / proses</span><span>Status</span><span>Informasi utama</span><span>Tenggat</span><span /></div><div className="empty-queue"><Search /><h3>Belum ada data pada ruang ini.</h3><p>{section === "rekomendasi" ? "Rekomendasi muncul setelah seluruh biodata dan verifikasi disetujui." : "Item baru akan muncul otomatis ketika membutuhkan tindakan Anda."}</p></div></div></section>;
}

const requiredQuestionKeys = ["education", "self", "experience", "religion", "lifestyle", "emotion", "marriage", "future", "criteria_physical", "criteria_nonphysical", "partner_questions", "life_story", "references"] as const;

function RequiredQuestions() {
  const [topic, setTopic] = useState<typeof requiredQuestionKeys[number]>("religion");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [onboardingReady, setOnboardingReady] = useState<boolean | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const definition = profileFormSections.find((item) => item.key === topic)!;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<Array<{ key: string; status: string }>>("/api/profile/sections", { signal: controller.signal }).then((rows) => { const done = new Set(rows.filter((row) => row.status === "complete").map((row) => row.key)); setCompleted(done); setOnboardingReady(onboardingGroups.flatMap((group) => group.sections).every((key) => done.has(key))); }).catch((reason) => { if (reason?.name !== "AbortError") setMessage("Status jawaban belum dapat dimuat."); });
    return () => controller.abort();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("saving"); setMessage("");
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); await apiFetch(`/api/profile/sections/${topic}`, { method: "PUT", body: JSON.stringify(values) }); setCompleted((value) => new Set(value).add(topic)); setState("saved"); } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Jawaban belum dapat disimpan."); }
  }

  if (onboardingReady === false) return <section className="dashboard-card required-questions-locked"><ShieldCheck /><div><h2>Selesaikan biodata dasar terlebih dahulu.</h2><p>Pertanyaan wajib dibuka setelah tiga tahap onboarding selesai. Jawaban dasar membantu pertanyaan ini dibaca dalam konteks yang benar.</p><Link href="/dashboard/biodata" className="app-primary" prefetch={false}>Lanjutkan onboarding <ArrowRight /></Link></div></section>;
  return <section className="required-questions-layout">
    <div className="required-questions-intro"><div><p className="mono">LANJUTAN SETELAH BIODATA</p><h2>Pertanyaan wajib untuk proses yang amanah.</h2><p>Jawaban tidak dinilai otomatis dan tidak menjadi konsumsi kandidat. Admin atau mediator hanya melihatnya sesuai kewenangan.</p></div><strong>{requiredQuestionKeys.filter((key) => completed.has(key)).length}/{requiredQuestionKeys.length}<small>topik selesai</small></strong></div>
    <nav className="question-topics" aria-label="Topik pertanyaan wajib">{requiredQuestionKeys.map((key, index) => { const item = profileFormSections.find((entry) => entry.key === key)!; return <button key={key} className={`${topic === key ? "active" : ""} ${completed.has(key) ? "complete" : ""}`} onClick={() => { setTopic(key); setState("idle"); setMessage(""); }}><span>{completed.has(key) ? <Check /> : index + 1}</span><div><strong>{item.label}</strong><small>{completed.has(key) ? "Selesai" : item.description}</small></div></button>; })}</nav>
    <form className="form-card required-question-form" onSubmit={submit}><header><div><p className="mono">TOPIK {requiredQuestionKeys.indexOf(topic) + 1} DARI {requiredQuestionKeys.length}</p><h2>{definition.label}</h2><p>{definition.description}</p></div><span className="autosave"><span /> Jawaban privat</span></header><div className="question-list">{definition.fields.map((field) => <label key={field.name}><span>{field.label} <em>*</em></span>{field.type === "textarea" ? <textarea name={field.name} rows={4} required placeholder="Tuliskan jawaban Anda dengan ringkas dan jujur…" /> : <input name={field.name} type={field.type ?? "text"} required placeholder="Tulis jawaban Anda…" />}</label>)}</div><PrivacyNote />{message ? <p className="form-error" role="alert">{message}</p> : null}{state === "saved" ? <p className="form-success">Topik tersimpan. Lanjutkan ke topik berikutnya.</p> : null}<footer><button type="button" className="app-secondary" disabled={requiredQuestionKeys.indexOf(topic) === 0} onClick={() => setTopic(requiredQuestionKeys[Math.max(0, requiredQuestionKeys.indexOf(topic) - 1)])}>Sebelumnya</button><button className="app-primary" disabled={state === "saving"}>{state === "saving" ? <><LoaderCircle className="spin" /> Menyimpan…</> : <>Simpan jawaban <ChevronRight /></>}</button></footer></form>
  </section>;
}

const guideSections = [
  { title: "01 · Niat, adab, dan verifikasi", text: "Gunakan platform untuk ikhtiar menuju pernikahan. Isi data dengan jujur, selesaikan verifikasi identitas, dan jaga adab komunikasi. Data yang belum diverifikasi tidak akan ditawarkan sebagai kandidat." },
  { title: "02 · Biodata dan rekomendasi", text: "Lengkapi biodata bertahap. Sistem hanya menampilkan ringkasan yang relevan—tanpa foto, kontak, atau alamat lengkap pada tahap awal. Rekomendasi bukan keputusan otomatis; tetap lakukan istikharah dan musyawarah keluarga." },
  { title: "03 · Pengajuan dan dual consent", text: "Mengirim pengajuan belum membuka komunikasi. Proses hanya menjadi Ta’aruf Aktif setelah peserta saling menyetujui dan, untuk proses akhwat, wali memberikan persetujuan terpisah. Salah satu pihak dapat menolak tanpa tekanan." },
  { title: "04 · Dialog dan pemeriksaan referensi", text: "Gunakan Inbox Terarah untuk pertanyaan yang jelas tentang visi pernikahan. Mediator mendampingi proses, dan referensi dari minimal tiga orang dapat diminta sebelum melanjutkan ke nazhor." },
  { title: "05 · Nazhor hingga khitbah", text: "Nazhor dilakukan pada waktu dan tempat yang disepakati, dengan wali atau mediator. Setelah nazhor, keluarga menentukan langkah berikutnya: lanjut, mundur, atau menutup proses. Khitbah dan akad berada di luar kewenangan aplikasi, namun statusnya dapat dicatat." },
  { title: "06 · Privasi, mundur, dan akun", text: "Jangan membagikan foto, dokumen, atau kontak di luar mekanisme. Anda boleh mundur kapan saja dengan alasan yang aman. Penonaktifan atau penghapusan akun mengikuti verifikasi dan SOP agar data serta riwayat keputusan tetap terlindungi." },
];

function ParticipantGuide() {
  return <section className="guide-layout">
    <div className="guide-intro"><BookOpen /><div><h2>Alur ta’aruf yang terarah</h2><p>Simak panduan ini sebelum mengirim pengajuan. Setiap tahap dirancang untuk menjaga persetujuan, keterlibatan wali, dan amanah data.</p></div></div>
    <div className="guide-list">{guideSections.map((item) => <details key={item.title} open={item.title.startsWith("01") || item.title.startsWith("02")}><summary>{item.title}<ChevronRight /></summary><p>{item.text}</p></details>)}</div>
    <div className="guide-actions"><Link href="/dashboard/biodata" className="app-primary" prefetch={false}>Lengkapi biodata <ArrowRight /></Link><Link href="/dashboard/pengaturan" className="app-secondary" prefetch={false}>Atur privasi akun</Link></div>
  </section>;
}

function ParticipantSettings({ user }: { user?: { name?: string; email?: string; role: AppRole } }) {
  const [signedOut, setSignedOut] = useState(false);
  async function signOut() { setSignedOut(true); await authClient.signOut(); window.location.href = "/masuk"; }
  return <section className="settings-layout">
    <div className="settings-card settings-identity"><div className="settings-icon"><UserRoundCheck /></div><div><p className="mono">IDENTITAS AKUN</p><h2>{user?.name || "Peserta terdaftar"}</h2><p>{user?.email || "Email belum tersedia"}</p><span className="status-chip"><span /> Email terverifikasi</span></div></div>
    <div className="settings-grid">
      <article className="settings-card"><LockKeyhole /><div><h3>Keamanan akun</h3><p>Gunakan kata sandi unik dan jangan membagikan kode akses kepada siapa pun.</p><Link href="/lupa-sandi" className="settings-link" prefetch={false}>Atur ulang kata sandi <ArrowRight /></Link></div></article>
      <article className="settings-card"><BellRing /><div><h3>Notifikasi</h3><p>Notifikasi proses, persetujuan, dan tenggat dikirim ke email terdaftar. Pastikan inbox tidak memblokir alamat platform.</p><span className="settings-muted">Notifikasi sistem aktif</span></div></article>
      <article className="settings-card"><EyeOff /><div><h3>Privasi data</h3><p>Nama lengkap, dokumen identitas, foto, dan jawaban sensitif dibuka bertahap sesuai tujuan dan kewenangan.</p><Link href="/dashboard/panduan" className="settings-link" prefetch={false}>Baca aturan visibilitas <ArrowRight /></Link></div></article>
      <article className="settings-card"><ShieldCheck /><div><h3>Status akun</h3><p>Akun tetap terlihat sesuai status verifikasi dan proses. Untuk penonaktifan sementara atau penghapusan data, ajukan melalui dukungan resmi agar identitas dapat diverifikasi.</p><Link href="/dashboard/panduan" className="settings-link" prefetch={false}>Lihat prosedur akun <ArrowRight /></Link></div></article>
    </div>
    <div className="settings-danger"><div><p className="mono">SESI AKUN</p><h3>Keluar dari semua sesi</h3><p>Gunakan ini jika memakai perangkat bersama atau merasa sesi Anda tidak aman.</p></div><button className="app-secondary" onClick={signOut} disabled={signedOut}>{signedOut ? <><LoaderCircle className="spin" /> Keluar…</> : <><LogOut /> Keluar akun</>}</button></div>
  </section>;
}

function AdminAvatarSettings({ role }: { role: AppRole }) {
  const [state, setState] = useState<Record<string, string>>({});
  async function upload(gender: "participant_male" | "participant_female", file?: File) {
    if (!file) return;
    setState((value) => ({ ...value, [gender]: "uploading" }));
    const body = new FormData(); body.set("gender", gender); body.set("file", file);
    try {
      const response = await fetch(`${apiUrl}/api/admin/avatar-defaults`, { method: "POST", body, credentials: "include" });
      setState((value) => ({ ...value, [gender]: response.ok ? "done" : "error" }));
    } catch { setState((value) => ({ ...value, [gender]: "error" })); }
  }
  const can = (gender: "participant_male" | "participant_female") => role === "super_admin" || (role === "admin_male" && gender === "participant_male") || (role === "admin_female" && gender === "participant_female");
  const card = (gender: "participant_male" | "participant_female", label: string, fileName: string) => <article className={`avatar-setting ${can(gender) ? "" : "is-disabled"}`}><img src={`/avatars/${fileName}.png`} alt={`Avatar default ${label}`} /><div><p className="mono">AVATAR DEFAULT</p><h3>{label}</h3><p>Dipakai otomatis untuk akun yang belum memiliki foto profil terverifikasi.</p><label className="app-secondary avatar-upload"><input type="file" accept="image/png,image/jpeg" disabled={!can(gender) || state[gender] === "uploading"} onChange={(event) => upload(gender, event.target.files?.[0])} />{state[gender] === "uploading" ? <><LoaderCircle className="spin" /> Mengunggah…</> : state[gender] === "done" ? <>Tersimpan</> : state[gender] === "error" ? <>Coba lagi</> : <>Ganti avatar</>}</label>{!can(gender) ? <small>Di luar wilayah admin ini.</small> : null}</div></article>;
  return <section className="avatar-settings-layout"><div className="dashboard-card avatar-settings-intro"><ShieldCheck /><div><h2>Avatar default peserta</h2><p>Pengaturan ini hanya tersedia untuk admin. Avatar dipisahkan berdasarkan gender dan tidak menggantikan foto verifikasi pribadi peserta.</p></div></div><div className="avatar-settings-grid">{card("participant_male", "Avatar Ikhwan", "pp_ikhwan")}{card("participant_female", "Avatar Akhwat", "pp_akhwat")}</div></section>;
}

type ParticipantDirectoryResponse = {
  items: Array<{
    id: string;
    displayCode: string;
    name: string;
    email?: string;
    role: "participant_male" | "participant_female";
    status: string;
    emailVerified: boolean;
    completionPercent: number;
    createdAt: string;
  }>;
  total: number;
};

const participantStatusLabels: Record<string, string> = {
  pending_email: "Menunggu email",
  pending_identity: "Menunggu identitas",
  profile_incomplete: "Biodata belum lengkap",
  under_review: "Dalam pemeriksaan",
  active_search: "Aktif mencari",
  focused: "Fokus kandidat",
  active_taaruf: "Ta’aruf aktif",
  cooldown: "Masa jeda",
  khitbah: "Khitbah",
  preparing_marriage: "Persiapan nikah",
  married: "Menikah",
  self_inactive: "Nonaktif mandiri",
  suspended: "Ditangguhkan",
  archived: "Diarsipkan",
};

function ParticipantDirectory() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [result, setResult] = useState<ParticipantDirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (appliedQuery) params.set("q", appliedQuery);
    apiFetch<ParticipantDirectoryResponse>(`/api/admin/participants${params.size ? `?${params}` : ""}`, { signal: controller.signal })
      .then(setResult)
      .catch((reason) => { if (reason?.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Data peserta belum dapat dimuat."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [appliedQuery, reload]);

  return <section className="queue-card">
    <form className="queue-tools" onSubmit={(event) => { event.preventDefault(); setAppliedQuery(query.trim()); }}>
      <div className="queue-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kode, nama panggilan, atau email…" /></div>
      <button type="submit"><Filter /> Terapkan</button>
    </form>
    {loading ? <div className="dashboard-loading"><div className="skeleton skeleton-panel" /><p><LoaderCircle className="spin" /> Memuat peserta…</p></div> : error ? <div className="dashboard-error"><ShieldCheck /><h2>Data peserta belum dapat dimuat.</h2><p>{error}</p><button className="app-primary" onClick={() => setReload((value) => value + 1)}><RefreshCw /> Coba lagi</button></div> : <div className="data-table">
      <div className="data-row data-head"><span>Peserta</span><span>Status</span><span>Kelengkapan</span><span>Bergabung</span><span /></div>
      {result && result.items.length > 0 ? result.items.map((participant) => <div className="data-row" key={participant.id}>
        <span><strong>{participant.displayCode}</strong><small>{participant.name}{participant.email ? ` · ${participant.email}` : ""}</small></span>
        <span><em className={participant.status === "profile_incomplete" ? "status-warn" : "status-neutral"}>{participantStatusLabels[participant.status] ?? participant.status}</em></span>
        <span><strong>{participant.completionPercent}%</strong><small>{roleLabels[participant.role]} · email {participant.emailVerified ? "terverifikasi" : "belum terverifikasi"}</small></span>
        <span><CalendarDays /> {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(participant.createdAt))}</span>
        <span />
      </div>) : <div className="empty-queue"><Search /><h3>Belum ada peserta pada cakupan ini.</h3><p>{appliedQuery ? "Tidak ada peserta yang cocok dengan pencarian." : "Akun peserta akan muncul otomatis setelah pendaftaran berhasil."}</p></div>}
      {result ? <div className="directory-total">{result.total} peserta ditemukan</div> : null}
    </div>}
  </section>;
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
  const activeGroup = onboardingGroups.find((group) => group.sections.includes(selectedKey)) ?? onboardingGroups[0];

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
  const definition = profileFormSections.find((item) => item.key === selectedKey) ?? profileFormSections.find((item) => item.key === activeGroup.sections[0])!;
  const onboardingSections = onboardingGroups.flatMap((group) => group.sections);
  const onboardingCompleted = new Set(onboardingSections.filter((key) => completed.has(key)));
  const percent = Math.round((onboardingCompleted.size / onboardingSections.length) * 100);

  if (section === "konfigurasi" && user) return <><header className="module-heading"><div><p className="mono">KONFIGURASI SISTEM</p><h1>Atur avatar default peserta.</h1><p>Hanya admin yang dapat mengganti avatar fallback ikhwan dan akhwat.</p></div></header><AdminAvatarSettings role={user.role} /></>;
  if (section === "pertanyaan-wajib") return <><header className="module-heading"><div><p className="mono">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p></div><Link href="/dashboard/biodata" className="app-secondary" prefetch={false}><FileText /> Kembali ke biodata</Link></header><RequiredQuestions /></>;

  return <>
    {section === "biodata" ? <OnboardingProgress activeGroup={activeGroup} completed={completed} percent={percent} selectedKey={selectedKey} /> : null}
    {section !== "biodata" ? <header className="module-heading"><div><p className="mono">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p></div><Link href="/dashboard/panduan" className="app-secondary" prefetch={false}><FileText /> Lihat panduan</Link></header> : null}
    {section !== "biodata" ? section === "peserta" ? <ParticipantDirectory /> : section === "panduan" ? <ParticipantGuide /> : section === "pengaturan" ? <ParticipantSettings user={user} /> : <QueueModule section={section} /> : loading ? <section className="dashboard-loading"><div className="skeleton skeleton-panel" /><p><LoaderCircle className="spin" /> Memuat progres biodata…</p></section> : error ? <section className="dashboard-error"><ShieldCheck /><h2>Progres biodata belum dapat dimuat.</h2><p>{error}</p><button className="app-primary" onClick={() => setReload((value) => value + 1)}><RefreshCw /> Coba lagi</button></section> : <div className="biodata-layout"><aside className="section-progress"><div><strong>{percent}%</strong><span>{completed.size} dari {profileFormSections.length} bagian</span></div>{profileFormSections.map((item, index) => <Link key={item.key} href={`/dashboard/biodata?bagian=${item.key}`} prefetch={false} className={`${item.key === definition.key ? "current" : ""} ${completed.has(item.key) ? "complete" : ""}`}><span>{completed.has(item.key) ? <Check /> : index + 1}</span>{item.label}<ChevronRight /></Link>)}</aside><section className="form-card"><header><div><p className="mono">BAGIAN {String(profileFormSections.indexOf(definition) + 1).padStart(2, "0")}</p><h2>{definition.label}</h2><p>{definition.description}</p></div><span className="autosave"><span /> Data privat</span></header>{user ? <ProfileForm sectionKey={definition.key} role={user.role} onSaved={() => setReload((value) => value + 1)} /> : <div className="dashboard-loading"><LoaderCircle className="spin" /></div>}</section></div>}
  </>;
}
