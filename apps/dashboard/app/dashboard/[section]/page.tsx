"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BellRing, BookOpen, BriefcaseBusiness, CalendarDays, Check, ChevronLeft, ChevronRight, EyeOff, FileText, Filter, GraduationCap, HeartHandshake, LoaderCircle, LockKeyhole, LogOut, MapPin, RefreshCw, Search, ShieldCheck, Sparkles, UserRoundCheck, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, apiUrl } from "@/lib/api-client";
import { navForRole, sectionCopy } from "@/lib/dashboard-config";
import { profileFormSections, type ProfileField } from "@/lib/profile-form";
import { roleLabels, type AppRole } from "@/lib/roles";
import { DocumentUpload } from "@/app/components/DocumentUpload";

type SaveState = "idle" | "drafting" | "drafted" | "draft-error" | "saving" | "saved" | "error";
type RegionItem = { code: string; name: string };

const onboardingGroups = [
  { key: "data-diri", label: "Data diri", description: "Identitas dasar yang paling penting untuk memulai.", sections: ["profile"] },
  { key: "fisik", label: "Fisik", description: "Gambaran fisik yang relevan dan secukupnya.", sections: ["physical"] },
  { key: "keluarga", label: "Keluarga", description: "Keluarga inti dan informasi yang berdampak pada pernikahan.", sections: ["family"] },
];

function PrivacyNote() {
  return <div className="sensitive-note"><ShieldCheck /><div><strong>Visibilitas data dijaga bertahap</strong><p>Nama lengkap, kontak, dokumen identitas, dan jawaban sensitif hanya dipakai sesuai kewenangan dan tidak ditampilkan otomatis kepada kandidat.</p></div></div>;
}

function ProfileForm({ sectionKey, role, onSaved }: { sectionKey: string; role: AppRole; onSaved: () => void }) {
  const router = useRouter();
  const definition = profileFormSections.find((item) => item.key === sectionKey) ?? profileFormSections[0];
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [regions, setRegions] = useState<{ provinces: RegionItem[]; regencies: RegionItem[]; districts: RegionItem[]; villages: RegionItem[] }>({ provinces: [], regencies: [], districts: [], villages: [] });
  const [locationValues, setLocationValues] = useState({ province: "", city: "", district: "", village: "" });
  const [regionLoading, setRegionLoading] = useState(false);
  const [characterCounts, setCharacterCounts] = useState<Record<string, number>>({});
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (definition.key !== "profile") return;
    const controller = new AbortController();
    setRegionLoading(true);
    fetch(`${apiUrl}/api/public/regions/provinces/all`, { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Wilayah belum dapat dimuat."))).then((body: { data: RegionItem[] }) => setRegions((value) => ({ ...value, provinces: body.data }))).catch((reason) => { if (reason?.name !== "AbortError") setMessage("Pilihan wilayah belum dapat dimuat. Coba refresh halaman."); }).finally(() => setRegionLoading(false));
    return () => controller.abort();
  }, [definition.key]);

  useEffect(() => {
    if (definition.key !== "profile" || !initialValues.province || !regions.provinces.length) return;
    let cancelled = false;
    const loadSavedRegions = async () => {
      try {
        const province = regions.provinces.find((item) => item.name === String(initialValues.province));
        if (!province) return;
        const regenciesResponse = await fetch(`${apiUrl}/api/public/regions/regencies/${province.code}`);
        const regencies = (await regenciesResponse.json() as { data: RegionItem[] }).data ?? [];
        if (cancelled) return;
        setRegions((value) => ({ ...value, regencies }));
        const city = regencies.find((item) => item.name === String(initialValues.city));
        if (!city) return;
        const districtsResponse = await fetch(`${apiUrl}/api/public/regions/districts/${city.code}`);
        const districts = (await districtsResponse.json() as { data: RegionItem[] }).data ?? [];
        if (cancelled) return;
        setRegions((value) => ({ ...value, districts }));
        const district = districts.find((item) => item.name === String(initialValues.district));
        if (!district) return;
        const villagesResponse = await fetch(`${apiUrl}/api/public/regions/villages/${district.code}`);
        const villages = (await villagesResponse.json() as { data: RegionItem[] }).data ?? [];
        if (!cancelled) setRegions((value) => ({ ...value, villages }));
      } catch { if (!cancelled) setMessage("Pilihan wilayah tersimpan belum dapat dimuat. Coba pilih ulang."); }
    };
    void loadSavedRegions();
    return () => { cancelled = true; };
  }, [definition.key, initialValues.province, initialValues.city, initialValues.district, regions.provinces]);

  useEffect(() => {
    if (definition.key === "identity") return;
    const controller = new AbortController();
    setInitialValues({});
    setCharacterCounts({});
    setState("idle");
    setMessage("");
    apiFetch<Record<string, unknown>>(definition.key === "profile" ? "/api/profile/core" : `/api/profile/sections/${definition.key}`, { signal: controller.signal }).then((data) => {
      setInitialValues(data);
      if (definition.key === "profile") setLocationValues({ province: String(data.province ?? ""), city: String(data.city ?? ""), district: String(data.district ?? ""), village: String(data.village ?? "") });
    }).catch((reason) => { if (reason?.name !== "AbortError") setMessage("Data tersimpan belum dapat dimuat."); });
    return () => controller.abort();
  }, [definition.key]);

  useEffect(() => () => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftAbortRef.current?.abort();
  }, [definition.key]);

  async function loadRegion(level: "regencies" | "districts" | "villages", code: string) {
    if (!code) return;
    setRegionLoading(true);
    try { const response = await fetch(`${apiUrl}/api/public/regions/${level}/${code}`); if (!response.ok) throw new Error("Wilayah belum dapat dimuat."); const body = await response.json() as { data: RegionItem[] }; setRegions((value) => ({ ...value, [level]: body.data, ...(level === "regencies" ? { districts: [], villages: [] } : level === "districts" ? { villages: [] } : {}) })); } catch { setMessage("Pilihan wilayah belum dapat dimuat. Coba pilih ulang."); } finally { setRegionLoading(false); }
  }

  function selectLocation(key: "province" | "city" | "district" | "village", value: string, code?: string) {
    setLocationValues((current) => ({ ...current, [key]: value, ...(key === "province" ? { city: "", district: "", village: "" } : key === "city" ? { district: "", village: "" } : key === "district" ? { village: "" } : {}) }));
    if (key === "province") { setRegions((current) => ({ ...current, regencies: [], districts: [], villages: [] })); void loadRegion("regencies", code ?? ""); }
    if (key === "city") { setRegions((current) => ({ ...current, districts: [], villages: [] })); void loadRegion("districts", code ?? ""); }
    if (key === "district") { setRegions((current) => ({ ...current, villages: [] })); void loadRegion("villages", code ?? ""); }
  }

  function scheduleDraft(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const changedField = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (changedField.tagName === "TEXTAREA" && changedField.name) setCharacterCounts((current) => ({ ...current, [changedField.name]: changedField.value.length }));
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    setState("drafting");
    draftTimerRef.current = setTimeout(async () => {
      draftAbortRef.current?.abort();
      const controller = new AbortController();
      draftAbortRef.current = controller;
      try {
        const values = Object.fromEntries(new FormData(form));
        await apiFetch(`/api/profile/sections/${definition.key}/draft`, { method: "PUT", body: JSON.stringify(values), signal: controller.signal });
        setState("drafted");
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") setState("draft-error");
      }
    }, 1500);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftAbortRef.current?.abort();
    setState("saving");
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiFetch(definition.key === "profile" ? "/api/profile/core" : `/api/profile/sections/${definition.key}`, { method: "PUT", body: JSON.stringify(values) });
      setState("saved");
      onSaved();
      const nextPath = definition.key === "profile" ? "/dashboard/biodata?bagian=physical" : definition.key === "physical" ? "/dashboard/biodata?bagian=family" : definition.key === "family" ? "/dashboard" : null;
      if (nextPath) router.push(nextPath);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Bagian belum dapat disimpan.");
    }
  }

  if (definition.key === "identity") return <div className="profile-form"><div className="upload-grid"><DocumentUpload kind="identity_card" label="KTP untuk verifikasi (opsional sesuai kebijakan)" /><DocumentUpload kind="identity_selfie" label="Selfie verifikasi privat" />{role === "participant_male" ? <DocumentUpload kind="profile_photo" label="Foto untuk tahap nazhor (opsional)" maxSizeMb={2} allowWebp /> : null}</div><PrivacyNote /></div>;

  const participantRole = role as "participant_male" | "participant_female";
  const coreFields: ProfileField[] = [
    { name: "fullName", label: "Nama lengkap sesuai KTP" }, { name: "birthDate", label: "Tanggal lahir", type: "date" }, { name: "birthPlace", label: "Tempat lahir", placeholder: "Contoh: Jakarta" }, { name: "phone", label: "No. HP/WhatsApp", placeholder: "Contoh: 6281234567890" },
    { name: "province", label: "Provinsi", type: "select" }, { name: "city", label: "Kota/kabupaten", type: "select" }, { name: "district", label: "Kecamatan", type: "select" }, { name: "village", label: "Kelurahan/desa", type: "select" },
    { name: "originCity", label: "Kota asal", placeholder: "Contoh: Jakarta" }, { name: "maritalStatus", label: "Status pernikahan", type: "select", options: role === "participant_female" ? ["Lajang", "Janda cerai hidup", "Janda cerai mati"] : ["Lajang", "Duda cerai hidup", "Duda cerai mati"] }, { name: "marriageForm", label: "Bentuk pernikahan yang diharapkan", type: "select", options: role === "participant_female" ? ["Monogami / satu pasangan", "Bersedia dipoligami dengan syarat", "Perlu dibahas bersama wali"] : ["Monogami / satu pasangan", "Poligami sesuai kemampuan dan ketentuan", "Belum menentukan"] }, { name: "manhaj", label: "Manhaj", placeholder: "Contoh: Salaf / jelaskan dengan ringkas" }, { name: "ethnicity", label: "Suku", placeholder: "Contoh: Betawi" }, { name: "occupation", label: "Pekerjaan", placeholder: "Contoh: Software Engineer" }, { name: "workplace", label: "Tempat bekerja", placeholder: "Contoh: perusahaan swasta di Jakarta, atau tulis tidak ingin menyebutkan", required: false },
    { name: "salaryRange", label: "Gaji per bulan", type: "select", options: ["Akan disampaikan saat proses ta’aruf", "Di bawah Rp3 juta", "Rp3–5 juta", "Rp5–7 juta", "Rp7–10 juta", "Di atas Rp10 juta"] }, { name: "educationLevel", label: "Pendidikan terakhir", type: "select", options: ["SMP", "SMA/SMK", "Diploma", "Sarjana", "Pascasarjana"] },
    { name: "quranReading", label: "Kemampuan baca Al-Qur’an", type: "select", options: ["Belum lancar", "Cukup", "Fasih"] }, { name: "quranMemorization", label: "Hafalan Al-Qur’an", type: "select", options: ["Belum ada", "Juz 30", "1–3 juz", "4–7 juz", "8–10 juz", "Lebih dari 10 juz"] },
    { name: "prayer", label: "Shalat wajib", type: "select", options: ["Menjaga 5 waktu", "Kadang terlewat", "Sedang memperbaiki"] }, { name: "studyFrequency", label: "Kajian per minggu", type: "select", options: ["Belum rutin", "1 kali", "2–3 kali", "Lebih dari 3 kali"] },
    { name: "music", label: "Preferensi musik", type: "select", options: ["Tidak", "Ya, sesekali", "Ya, rutin"] }, { name: "smoking", label: "Merokok", type: "select", options: ["Tidak", "Ya"] }, { name: "widowMarriage", label: role === "participant_female" ? "Bersedia menikah dengan duda?" : "Bersedia menikah dengan janda?", type: "select", options: ["Ya", "Tidak", "Akan dibahas bersama keluarga"] },
  ];
  const fields = definition.key === "profile" ? coreFields : definition.fields.filter((field) => !field.visibleFor || field.visibleFor.includes(role as "participant_male" | "participant_female"));
  const isAdvancedSection = !["profile", "physical", "family"].includes(definition.key);
  const fieldGroups = definition.key === "profile" ? [
    { title: "Informasi dasar", fields: fields.slice(0, 4), optional: false },
    { title: "Domisili", fields: fields.slice(4, 9), optional: false },
    { title: "Status & latar belakang", fields: fields.slice(9, 13), optional: false },
    { title: "Pekerjaan & pendidikan", fields: fields.slice(13, 17), optional: false },
    { title: "Ibadah dasar", fields: fields.slice(17, 21), optional: false },
    { title: "Preferensi pribadi", fields: fields.slice(21), optional: false },
  ].filter((group) => group.fields.length > 0) : isAdvancedSection ? [
    { title: "Wajib dijawab", fields: fields.filter((field) => field.required !== false), optional: false },
    { title: "Tambahan untuk kecocokan", fields: fields.filter((field) => field.required === false), optional: true },
  ].filter((group) => group.fields.length > 0) : [{ title: "", fields, optional: false }];
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
    hairType: "Pilih tipe rambut",
    physicalDisability: "Kosongkan jika tidak ada",
    medicalHistory: "Kosongkan jika tidak ada",
  };
  const placeholderFor = (name: string, type?: string) => placeholders[name] ?? (type === "textarea" ? "Tuliskan jawaban Anda secara ringkas…" : "Tulis jawaban Anda…");
  function renderField(field: ProfileField, fieldIndex: number) {
    const id = `${definition.key}-${field.name}`;
    const fieldLabel = field.labelFor?.[participantRole] ?? field.label;
    const placeholder = field.placeholder ?? placeholderFor(field.name, field.type);
    const regionKey = field.name === "province" ? "provinces" : field.name === "city" ? "regencies" : field.name === "district" ? "districts" : field.name === "village" ? "villages" : null;
    const configuredOptions = field.optionsFor?.[participantRole] ?? field.options ?? [];
    const options: RegionItem[] = regionKey ? regions[regionKey] : configuredOptions.map((name) => ({ code: name, name }));
    const disabled = field.name === "city" ? !locationValues.province : field.name === "district" ? !locationValues.city : field.name === "village" ? !locationValues.district : false;
    const rawSavedValue = String(initialValues[field.name] ?? "");
    const savedValue = field.name === "birthDate" && rawSavedValue ? rawSavedValue.slice(0, 10) : rawSavedValue;
    const isRequired = field.required !== false;
    return <label key={field.name} htmlFor={id}>
      <span>{isAdvancedSection ? <b className="question-number">No. {String(fieldIndex + 1).padStart(2, "0")}</b> : null}{fieldLabel} {isRequired ? <em>*</em> : null}</span>
      {field.type === "textarea" ? <textarea id={id} name={field.name} rows={4} required={isRequired} minLength={isAdvancedSection && isRequired ? 10 : undefined} defaultValue={savedValue} placeholder={placeholder} aria-describedby={`${id}-hint`} /> : field.type === "select" ? <select id={id} name={field.name} required={isRequired} value={regionKey ? locationValues[field.name as keyof typeof locationValues] : undefined} defaultValue={regionKey ? undefined : savedValue} disabled={disabled} onChange={regionKey ? (event) => { const selected = options.find((option) => option.name === event.target.value); selectLocation(field.name as "province" | "city" | "district" | "village", event.target.value, selected?.code); } : undefined}><option value="" disabled={isRequired}>{regionLoading && regionKey ? "Memuat wilayah…" : disabled ? "Pilih wilayah di atas dulu" : placeholder}</option>{options.map((option) => <option key={option.code} value={option.name}>{option.name}</option>)}</select> : <input id={id} name={field.name} type={field.type ?? "text"} min={field.name === "heightCm" ? 120 : field.name === "weightKg" ? 30 : undefined} max={field.name === "heightCm" ? 230 : field.name === "weightKg" ? 250 : undefined} required={isRequired} defaultValue={savedValue} placeholder={placeholder} aria-describedby={`${id}-hint`} />}
      <small id={`${id}-hint`} className={isAdvancedSection && field.type === "textarea" ? "answer-meta" : undefined}>{isAdvancedSection && field.type === "textarea" ? `${characterCounts[field.name] ?? savedValue.length} karakter • akan tersimpan otomatis` : isRequired ? "Wajib diisi" : "Opsional"}</small>
    </label>;
  }

  return <form key={Object.keys(initialValues).length} className="profile-form" onSubmit={submit} onInput={isAdvancedSection ? scheduleDraft : undefined}>
    {definition.key === "profile" ? <input type="hidden" name="gender" value={role === "participant_female" ? "Akhwat" : "Ikhwan"} /> : null}
    <div className="profile-field-groups">{fieldGroups.map((group) => {
      const fieldsContent = <div className="field-grid">{group.fields.map(renderField)}</div>;
      if (group.optional) return <details className="profile-optional-group" key={group.title}><summary><span><strong>{group.title}</strong><small>{group.fields.length} pertanyaan opsional untuk membantu pencocokan</small></span><ChevronRight /></summary>{fieldsContent}</details>;
      return <section className="profile-field-group" key={group.title || definition.key}>{group.title ? <div className="field-group-heading"><h3>{group.title}</h3>{isAdvancedSection ? <small>{group.fields.length} pertanyaan inti</small> : null}</div> : null}{fieldsContent}</section>;
    })}</div>
    {definition.key === "physical" && role === "participant_male" ? <div className="upload-grid physical-selfie-upload"><DocumentUpload kind="profile_photo" label="Foto terbaru (opsional)" maxSizeMb={2} allowWebp /><p className="field-note">Foto disimpan privat dan hanya dapat dibuka sesuai persetujuan serta tahap proses.</p></div> : null}
    {isAdvancedSection ? <p className={`form-autosave ${state}`} aria-live="polite"><span />{state === "drafting" ? "Menunggu Anda selesai mengetik…" : state === "drafted" ? "Draft tersimpan otomatis" : state === "draft-error" ? "Draft belum tersimpan—periksa koneksi" : "Jawaban disimpan otomatis 1,5 detik setelah Anda berhenti mengetik"}</p> : null}
    <label className="form-attestation"><input type="checkbox" name="_attestation" required /><span>Saya menyatakan data pada bagian ini benar dan dapat dipertanggungjawabkan.</span></label>
    <PrivacyNote />
    {message ? <p className="form-error" role="alert">{message}</p> : null}
    {state === "saved" ? <p className="form-success">Bagian tersimpan dan progres telah diperbarui.</p> : null}
    <footer><Link href="/dashboard" className="app-secondary" prefetch={false}>Simpan nanti</Link><button className="app-primary" disabled={state === "saving"}>{state === "saving" ? <><LoaderCircle className="spin" /> Menyimpan…</> : <>Simpan bagian <ChevronRight /></>}</button></footer>
  </form>;
}

function OnboardingProgress({ activeGroup, completed, percent }: { activeGroup: typeof onboardingGroups[number]; completed: Set<string>; percent: number }) {
  const activeIndex = onboardingGroups.findIndex((group) => group.key === activeGroup.key);
  return <div className="onboarding-progress">
    <div className="onboarding-progress-head"><div><p className="mono">LANGKAH {activeIndex + 1} DARI {onboardingGroups.length}</p><h2>{activeGroup.label}</h2><p>{activeGroup.description}</p></div><strong>{percent}%<small>selesai</small></strong></div>
    <div className="onboarding-progress-track" aria-label={`Progres onboarding ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
    <div className="onboarding-steps">{onboardingGroups.map((group, index) => { const done = group.sections.every((key) => completed.has(key)); const unlocked = index === 0 || onboardingGroups[index - 1].sections.every((key) => completed.has(key)); const current = group.key === activeGroup.key; return <Link key={group.key} href={unlocked ? `/dashboard/biodata?bagian=${group.sections[0]}` : `/dashboard/biodata?bagian=${activeGroup.sections[0]}`} prefetch={false} onClick={(event) => { if (!unlocked) event.preventDefault(); }} aria-disabled={!unlocked} aria-current={current ? "step" : undefined} className={`onboarding-step ${current ? "current" : ""} ${done ? "complete" : ""} ${!unlocked ? "locked" : ""}`}><span>{done ? <Check /> : index + 1}</span><strong>{group.label}</strong></Link>; })}</div>
  </div>;
}

function QueueModule({ section }: { section: string }) {
  return <section className="queue-card"><div className="queue-tools"><div className="queue-search"><Search /><input placeholder="Cari kode atau status…" /></div><button><Filter /> Filter</button></div><div className="data-table"><div className="data-row data-head"><span>Kode / proses</span><span>Status</span><span>Informasi utama</span><span>Tenggat</span><span /></div><div className="empty-queue"><Search /><h3>Belum ada data pada ruang ini.</h3><p>{section === "rekomendasi" ? "Rekomendasi muncul setelah seluruh biodata dan verifikasi disetujui." : "Item baru akan muncul otomatis ketika membutuhkan tindakan Anda."}</p></div></div></section>;
}

type Recommendation = {
  id: string;
  score: number;
  reasons: string[];
  expiresAt: string;
  candidate: {
    id: string;
    displayCode: string;
    role: "participant_male" | "participant_female";
    ageBand: string;
    province: string | null;
    city: string | null;
    ethnicity: string | null;
    maritalStatus: string | null;
    educationLevel: string | null;
    occupationField: string | null;
    manhaj: string | null;
    marriageTarget: string;
  };
};

function RecommendationModule() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiFetch<Recommendation[]>("/api/recommendations", { signal: controller.signal })
      .then(setItems)
      .catch((reason) => {
        if (reason?.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Rekomendasi belum dapat dimuat.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selected]);

  if (loading) return <section className="match-loading" aria-label="Memuat rekomendasi"><div className="match-skeleton-grid">{[1, 2, 3].map((item) => <div className="skeleton match-skeleton-card" key={item} />)}</div><p><LoaderCircle className="spin" /> Menyusun pilihan yang relevan…</p></section>;
  if (error) return <section className="dashboard-error"><ShieldCheck /><h2>Rekomendasi belum dapat dimuat.</h2><p>{error}</p><button className="app-primary" onClick={() => setReload((value) => value + 1)}><RefreshCw /> Coba lagi</button></section>;

  return <section className="match-space">
    <header className="match-intro">
      <div><p className="mono">PILIHAN TERKURASI</p><h2>{items.length > 0 ? `${items.length} profil untuk ditinjau pelan-pelan.` : "Belum ada profil yang dapat ditampilkan."}</h2><p>Ini bukan sistem swipe. Baca ringkasan secukupnya, lakukan istikharah, lalu libatkan keluarga sebelum mengambil langkah.</p></div>
      <aside><ShieldCheck /><span><strong>Privasi tahap awal</strong>Nama, kontak, foto, dan alamat lengkap tetap tertutup.</span></aside>
    </header>

    {items.length > 0 ? <div className="match-grid">
      {items.map((item, index) => {
        const candidate = item.candidate;
        const avatar = candidate.role === "participant_female" ? "pp_akhwat" : "pp_ikhwan";
        return <article className="match-card" key={item.id} style={{ "--match-delay": `${Math.min(index, 6) * 55}ms` } as React.CSSProperties}>
          <div className="match-card-top">
            <div className="match-avatar"><img src={`/avatars/${avatar}.png`} alt={`Avatar default ${candidate.role === "participant_female" ? "akhwat" : "ikhwan"}`} /><span>{String(index + 1).padStart(2, "0")}</span></div>
            <div className="match-score"><strong>{item.score}%</strong><span>kecocokan awal</span></div>
          </div>
          <div className="match-identity"><p>{candidate.role === "participant_female" ? "AKHWAT" : "IKHWAN"} · {candidate.displayCode}</p><h3>{candidate.ageBand}</h3><span><MapPin /> {[candidate.city, candidate.province].filter(Boolean).join(", ") || "Domisili belum tersedia"}</span></div>
          <div className="match-facts">
            <span><GraduationCap /><small>Pendidikan</small><strong>{candidate.educationLevel || "Belum tersedia"}</strong></span>
            <span><BriefcaseBusiness /><small>Bidang aktivitas</small><strong>{candidate.occupationField || "Belum tersedia"}</strong></span>
            <span><HeartHandshake /><small>Status</small><strong>{candidate.maritalStatus || "Belum tersedia"}</strong></span>
            <span><Sparkles /><small>Manhaj</small><strong>{candidate.manhaj || "Belum tersedia"}</strong></span>
          </div>
          <div className="match-reason-preview"><Check /><span>{item.reasons[0] || "Profil memenuhi kriteria dasar Anda."}</span></div>
          <button className="match-card-action" onClick={() => setSelected(item)}>Tinjau ringkasan <ArrowRight /></button>
        </article>;
      })}
    </div> : <div className="match-empty"><Search /><h3>Belum ada rekomendasi aktif.</h3><p>Profil Anda tetap tersimpan. Rekomendasi akan muncul setelah ada kandidat terverifikasi yang memenuhi batas dasar kedua pihak.</p><Link href="/dashboard/biodata" className="app-secondary" prefetch={false}>Periksa kriteria pasangan</Link></div>}

    {selected ? <div className="match-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
      <section className="match-dialog" role="dialog" aria-modal="true" aria-labelledby="match-dialog-title">
        <button className="match-dialog-close" onClick={() => setSelected(null)} aria-label="Tutup ringkasan"><X /></button>
        <p className="mono">RINGKASAN TAHAP AWAL · {selected.candidate.displayCode}</p>
        <h2 id="match-dialog-title">{selected.candidate.ageBand}, {selected.candidate.city || selected.candidate.province || "Indonesia"}</h2>
        <p>Informasi ini sengaja terbatas. Kecocokan awal membantu menyaring, bukan menggantikan istikharah, pemeriksaan, dan keputusan keluarga.</p>
        <div className="match-dialog-facts">
          <span><small>Pendidikan</small><strong>{selected.candidate.educationLevel || "Belum tersedia"}</strong></span>
          <span><small>Pekerjaan</small><strong>{selected.candidate.occupationField || "Belum tersedia"}</strong></span>
          <span><small>Suku</small><strong>{selected.candidate.ethnicity || "Tidak dijadikan syarat"}</strong></span>
          <span><small>Target menikah</small><strong>{selected.candidate.marriageTarget}</strong></span>
        </div>
        <div className="match-dialog-reasons"><h3>Alasan kecocokan awal</h3>{selected.reasons.map((reason) => <span key={reason}><Check /> {reason}</span>)}</div>
        <footer><Link href="/dashboard/panduan" className="app-secondary" prefetch={false}>Baca alur pengajuan</Link><button className="app-primary" onClick={() => setSelected(null)}>Simpan untuk dipertimbangkan</button></footer>
      </section>
    </div> : null}
  </section>;
}

const questionSectionKeys = ["self", "religion", "marriage", "future", "partner_questions", "criteria_nonphysical", "references", "emotion", "lifestyle", "life_story", "education", "experience", "family_details", "criteria_physical"] as const;
const essentialQuestionKeys = ["self", "religion", "marriage", "future", "partner_questions", "criteria_nonphysical", "references"] as const;
const optionalQuestionKeys = ["emotion", "lifestyle", "life_story", "education", "experience", "family_details", "criteria_physical"] as const;

function RequiredQuestions() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (session?.user as ({ role?: AppRole } | undefined))?.role;
  const requestedTopic = searchParams.get("topik");
  const [topic, setTopic] = useState<typeof questionSectionKeys[number]>(() => questionSectionKeys.includes(requestedTopic as typeof questionSectionKeys[number]) ? requestedTopic as typeof questionSectionKeys[number] : "self");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [onboardingReady, setOnboardingReady] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const definition = profileFormSections.find((item) => item.key === topic)!;
  const isOptionalTopic = optionalQuestionKeys.includes(topic as typeof optionalQuestionKeys[number]);
  const flowKeys = isOptionalTopic ? optionalQuestionKeys : essentialQuestionKeys;
  const topicIndex = flowKeys.indexOf(topic as never);
  const previousTopic = topicIndex > 0 ? flowKeys[topicIndex - 1] : null;
  const nextTopic = topicIndex < flowKeys.length - 1 ? flowKeys[topicIndex + 1] : null;
  const completedCount = essentialQuestionKeys.filter((key) => completed.has(key)).length;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<Array<{ key: string; status: string }>>("/api/profile/sections", { signal: controller.signal }).then((rows) => { const done = new Set(rows.filter((row) => row.status === "complete").map((row) => row.key)); setCompleted(done); setOnboardingReady(onboardingGroups.flatMap((group) => group.sections).every((key) => done.has(key))); }).catch((reason) => { if (reason?.name !== "AbortError") setMessage("Status jawaban belum dapat dimuat."); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (questionSectionKeys.includes(requestedTopic as typeof questionSectionKeys[number])) setTopic(requestedTopic as typeof questionSectionKeys[number]);
  }, [requestedTopic]);

  if (onboardingReady === false) return <section className="dashboard-card required-questions-locked"><ShieldCheck /><div><h2>Selesaikan biodata dasar terlebih dahulu.</h2><p>Pertanyaan wajib dibuka setelah tiga tahap onboarding selesai. Jawaban dasar membantu pertanyaan ini dibaca dalam konteks yang benar.</p><Link href="/dashboard/biodata" className="app-primary" prefetch={false}>Lanjutkan onboarding <ArrowRight /></Link></div></section>;
  return <section className="required-questions-layout">
    <div className="advanced-topic-bar">
      <Link href="/dashboard/biodata" prefetch={false}><ChevronLeft /> Semua bagian</Link>
      <div><span>{completedCount} dari {essentialQuestionKeys.length} bagian wajib selesai</span><i><b style={{ width: `${Math.round((completedCount / essentialQuestionKeys.length) * 100)}%` }} /></i></div>
      <nav aria-label="Pindah bagian biodata"><span className={!previousTopic ? "disabled" : ""}>{previousTopic ? <Link href={`/dashboard/pertanyaan-wajib?topik=${previousTopic}`} prefetch={false} aria-label="Bagian sebelumnya">←</Link> : "←"}</span><span className={!nextTopic ? "disabled" : ""}>{nextTopic ? <Link href={`/dashboard/pertanyaan-wajib?topik=${nextTopic}`} prefetch={false} aria-label="Bagian berikutnya">→</Link> : "→"}</span></nav>
    </div>
    <section className="form-card required-question-form"><header><div><p className="mono">{isOptionalTopic ? "TAMBAHAN OPSIONAL" : `BAGIAN ${topicIndex + 1} DARI ${essentialQuestionKeys.length}`}</p><h2>{definition.label}</h2><p>{definition.description}</p></div></header><div className="question-guidance"><span>{isOptionalTopic ? "Boleh dilewati atau diisi sebagian" : "Hanya pertanyaan inti yang wajib dijawab"}</span><span>Draft tersimpan otomatis setelah 1,5 detik</span></div>{message ? <p className="form-error" role="alert">{message}</p> : null}{role ? <ProfileForm sectionKey={topic} role={role} onSaved={() => { setCompleted((value) => new Set(value).add(topic)); router.push(!isOptionalTopic && nextTopic ? `/dashboard/pertanyaan-wajib?topik=${nextTopic}` : "/dashboard/biodata"); }} /> : <div className="dashboard-loading"><LoaderCircle className="spin" /></div>}</section>
  </section>;
}

const biodataHubGroups = [
  { key: "identity", title: "Foto & verifikasi", description: "Dokumen dan foto privat untuk pemeriksaan admin.", sections: ["identity"], optional: true },
  { key: "self", title: "Diri & karakter", description: "Kelebihan, kekurangan, target hidup, dan batas penting.", sections: ["self"], optional: false },
  { key: "religion", title: "Ibadah & pemahaman", description: "Kebiasaan ibadah, aqidah, dan manhaj untuk review manual.", sections: ["religion"], optional: false },
  { key: "marriage", title: "Pernikahan & harapan", description: "Kesiapan, visi keluarga, domisili, anak, dan keuangan.", sections: ["marriage", "future", "partner_questions"], optional: false },
  { key: "criteria_nonphysical", title: "Kriteria pasangan", description: "Batas utama terkait agama, karakter, status, dan domisili.", sections: ["criteria_nonphysical"], optional: false },
  { key: "references", title: "Referensi", description: "Tiga orang yang mengenal keseharian Anda.", sections: ["references"], optional: false },
  { key: "lifestyle", title: "Tambahan kecocokan", description: "Emosi, pola hidup, pendidikan, keluarga, pengalaman, dan preferensi fisik.", sections: ["emotion", "lifestyle", "life_story", "education", "experience", "family_details", "criteria_physical"], optional: true },
] as const;

function BiodataHub({ completed }: { completed: Set<string> }) {
  const requiredSections = biodataHubGroups.filter((group) => !group.optional).flatMap((group) => [...group.sections]);
  const completeCount = requiredSections.filter((key) => completed.has(key)).length;
  const percent = Math.round((completeCount / requiredSections.length) * 100);
  return <section className="biodata-hub">
    <header><div><p className="mono">BIODATA LANJUTAN</p><h1>Lengkapi satu bagian dalam satu waktu.</h1><p>Bagian dasar sudah selesai. Pilih satu topik berikut tanpa perlu mengerjakan semuanya sekaligus.</p></div><div className="hub-progress"><strong>{percent}%</strong><span>{completeCount} dari {requiredSections.length} topik</span><i><b style={{ width: `${percent}%` }} /></i></div></header>
    <div className="biodata-hub-grid">
      {biodataHubGroups.map((group, index) => {
        const pending = group.sections.find((key) => !completed.has(key));
        const done = !group.optional && !pending;
        const href = group.key === "identity" ? "/dashboard/biodata?bagian=identity" : `/dashboard/pertanyaan-wajib?topik=${pending ?? group.sections[0]}`;
        return <Link href={href} prefetch={false} key={group.key} className={done ? "complete" : ""}><span>{done ? <Check /> : String(index + 1).padStart(2, "0")}</span><div><strong>{group.title}</strong><p>{group.description}</p><small>{group.optional ? group.key === "identity" ? "Opsional & privat" : "Opsional • bantu hasil lebih cocok" : done ? "Selesai" : `${group.sections.filter((key) => completed.has(key)).length}/${group.sections.length} topik selesai`}</small></div><ChevronRight /></Link>;
      })}
    </div>
    <div className="biodata-hub-actions"><Link href="/dashboard/biodata?bagian=profile" className="app-secondary" prefetch={false}>Edit data dasar</Link><Link href={`/dashboard/pertanyaan-wajib?topik=${requiredSections.find((key) => !completed.has(key)) ?? "self"}`} className="app-primary" prefetch={false}>Lanjutkan bagian berikutnya <ArrowRight /></Link></div>
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
        <span><strong>{participant.displayCode}{participant.displayCode.startsWith("TEST-") ? <em className="test-data-badge">DATA TEST</em> : null}</strong><small>{participant.name}{participant.email ? ` · ${participant.email}` : ""}</small></span>
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

  const allowed = useMemo(() => user ? navForRole(user.role).some((item) => item.href === `/dashboard/${section}`) || (user.role.startsWith("participant_") && section === "pertanyaan-wajib") : true, [section, user]);
  if (!allowed) return <section className="dashboard-error"><ShieldCheck /><h1>Ruang ini bukan bagian dari amanah Anda.</h1><Link className="app-primary" href="/dashboard">Kembali ke dashboard</Link></section>;
  const copy = sectionCopy[section] ?? { eyebrow: "RUANG KERJA", title: section.replaceAll("-", " "), body: "Kelola informasi dan tindakan yang menjadi kewenangan Anda pada ruang ini." };
  const definition = profileFormSections.find((item) => item.key === selectedKey) ?? profileFormSections.find((item) => item.key === activeGroup.sections[0])!;
  const onboardingSections = onboardingGroups.flatMap((group) => group.sections);
  const onboardingCompleted = new Set(onboardingSections.filter((key) => completed.has(key)));
  const percent = Math.round((onboardingCompleted.size / onboardingSections.length) * 100);
  const baseComplete = onboardingCompleted.size === onboardingSections.length;
  const showBiodataHub = section === "biodata" && baseComplete && !query.get("bagian");

  if (section === "konfigurasi" && user) return <><header className="module-heading"><div><p className="mono">KONFIGURASI SISTEM</p><h1>Atur avatar default peserta.</h1><p>Hanya admin yang dapat mengganti avatar fallback ikhwan dan akhwat.</p></div></header><AdminAvatarSettings role={user.role} /></>;
  if (section === "pertanyaan-wajib") return <RequiredQuestions />;

  return <>
    {section === "biodata" && !baseComplete ? <OnboardingProgress activeGroup={activeGroup} completed={completed} percent={percent} /> : null}
    {section !== "biodata" ? <header className="module-heading"><div><p className="mono">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p></div><Link href="/dashboard/panduan" className="app-secondary" prefetch={false}><FileText /> Lihat panduan</Link></header> : null}
    {section !== "biodata" ? section === "peserta" ? <ParticipantDirectory /> : section === "rekomendasi" && user?.role.startsWith("participant_") ? <RecommendationModule /> : section === "panduan" ? <ParticipantGuide /> : section === "pengaturan" ? <ParticipantSettings user={user} /> : <QueueModule section={section} /> : loading ? <section className="dashboard-loading"><div className="skeleton skeleton-panel" /><p><LoaderCircle className="spin" /> Memuat progres biodata…</p></section> : error ? <section className="dashboard-error"><ShieldCheck /><h2>Progres biodata belum dapat dimuat.</h2><p>{error}</p><button className="app-primary" onClick={() => setReload((value) => value + 1)}><RefreshCw /> Coba lagi</button></section> : showBiodataHub ? <BiodataHub completed={completed} /> : <div className="biodata-layout"><aside className="section-progress"><div><strong>{percent}%</strong><span>{completed.size} bagian tersimpan</span></div></aside><section className="form-card"><header><div><p className="mono">{baseComplete ? "EDIT BIODATA" : `LANGKAH ${onboardingGroups.findIndex((group) => group.sections.includes(definition.key)) + 1}`}</p><h2>{definition.label}</h2><p>{definition.description}</p></div></header>{user ? <ProfileForm sectionKey={definition.key} role={user.role} onSaved={() => setReload((value) => value + 1)} /> : <div className="dashboard-loading"><LoaderCircle className="spin" /></div>}</section></div>}
  </>;
}
