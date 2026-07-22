import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { navForRole, sectionCopy } from "@/lib/dashboard-config";
import { requireSession } from "@/lib/session";
import { saveProfileCore, saveProfileSection } from "@/app/dashboard/actions";
import { profileFormSections } from "@/lib/profile-form";
import { DocumentUpload } from "@/app/components/DocumentUpload";
import { db } from "@/db";
import { profileSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { retryTransientRead } from "@/lib/retry";
import { PendingSubmitButton } from "@/app/components/PendingSubmitButton";

function ProfileCoreForm({ role }: { role: string }) {
  return (
    <form className="profile-form" action={saveProfileCore}>
      <div className="field-grid">
        <label>
          Username
          <input name="username" required />
        </label>
        <label>
          Jenis kelamin
          <select
            name="gender"
            defaultValue={role === "participant_female" ? "Akhwat" : "Ikhwan"}
            disabled
          >
            <option>Ikhwan</option>
            <option>Akhwat</option>
          </select>
          <input
            type="hidden"
            name="gender"
            value={role === "participant_female" ? "Akhwat" : "Ikhwan"}
          />
        </label>
        <label>
          Tanggal lahir
          <input name="birthDate" type="date" required />
        </label>
        <label>
          Status pernikahan
          <select name="maritalStatus" required>
            <option value="">Pilih status</option>
            <option>Belum pernah menikah</option>
            <option>Duda</option>
            <option>Janda</option>
          </select>
        </label>
        <label>
          Provinsi
          <input name="province" required />
        </label>
        <label>
          Kota/kabupaten
          <input name="city" required />
        </label>
        <label>
          Manhaj
          <input name="manhaj" required />
        </label>
        <label>
          Suku
          <input name="ethnicity" required />
        </label>
        <label>
          Tinggi badan
          <div className="unit-input">
            <input name="heightCm" type="number" min="120" max="230" required />
            <span>cm</span>
          </div>
        </label>
        <label>
          Berat badan
          <div className="unit-input">
            <input name="weightKg" type="number" min="30" max="250" required />
            <span>kg</span>
          </div>
        </label>
      </div>
      <label>
        Tempat dan bidang pekerjaan
        <textarea name="occupation" rows={3} required />
      </label>
      <FormPrivacy />
      <FormFooter />
    </form>
  );
}

function FormPrivacy() {
  return (
    <div className="sensitive-note">
      <ShieldCheck />
      <div>
        <strong>Visibilitas data dijaga bertahap</strong>
        <p>
          Kontak, dokumen identitas, dan jawaban sensitif tidak ditampilkan
          otomatis kepada kandidat.
        </p>
      </div>
    </div>
  );
}
function FormFooter() {
  return (
    <footer>
      <Link href="/dashboard" className="app-secondary">
        Simpan nanti
      </Link>
      <PendingSubmitButton />
    </footer>
  );
}

function BiodataModule({
  selectedKey,
  completed,
  role,
}: {
  selectedKey: string;
  completed: Set<string>;
  role: string;
}) {
  const definition =
    profileFormSections.find((item) => item.key === selectedKey) ??
    profileFormSections[0];
  const done = completed.size;
  const percent = Math.round((done / profileFormSections.length) * 100);
  return (
    <div className="biodata-layout">
      <aside className="section-progress">
        <div>
          <strong>{percent}%</strong>
          <span>
            {done} dari {profileFormSections.length} bagian
          </span>
        </div>
        {profileFormSections.map((item, index) => (
          <Link
            key={item.key}
            href={`/dashboard/biodata?bagian=${item.key}`}
            className={`${item.key === definition.key ? "current" : ""} ${completed.has(item.key) ? "complete" : ""}`}
          >
            <span>{completed.has(item.key) ? <Check /> : index + 1}</span>
            {item.label}
            <ChevronRight />
          </Link>
        ))}
      </aside>
      <section className="form-card">
        <header>
          <div>
            <p className="mono">
              BAGIAN{" "}
              {String(profileFormSections.indexOf(definition) + 1).padStart(
                2,
                "0",
              )}
            </p>
            <h2>{definition.label}</h2>
            <p>{definition.description}</p>
          </div>
          <span className="autosave">
            <span /> Tersimpan otomatis
          </span>
        </header>
        {definition.key === "profile" ? (
          <ProfileCoreForm role={role} />
        ) : definition.key === "identity" ? (
          <div className="profile-form">
            <div className="upload-grid">
              <DocumentUpload
                kind="identity_card"
                label="Foto KTP bagian depan"
              />
              <DocumentUpload
                kind="identity_selfie"
                label="Foto verifikasi diri bersama KTP"
              />
              <DocumentUpload
                kind="profile_photo"
                label="Foto peserta untuk verifikasi"
              />
            </div>
            <FormPrivacy />
          </div>
        ) : (
          <form className="profile-form" action={saveProfileSection}>
            <input type="hidden" name="sectionKey" value={definition.key} />
            <div className="field-grid">
              {definition.fields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea name={field.name} rows={4} required />
                  ) : (
                    <input
                      name={field.name}
                      type={field.type ?? "text"}
                      required
                    />
                  )}
                </label>
              ))}
            </div>
            <FormPrivacy />
            <FormFooter />
          </form>
        )}
      </section>
    </div>
  );
}

function QueueModule({ section }: { section: string }) {
  return (
    <section className="queue-card">
      <div className="queue-tools">
        <div className="queue-search">
          <Search />
          <input placeholder="Cari kode atau status…" />
        </div>
        <button>
          <Filter /> Filter
        </button>
      </div>
      <div className="data-table">
        <div className="data-row data-head">
          <span>Kode / proses</span>
          <span>Status</span>
          <span>Informasi utama</span>
          <span>Tenggat</span>
          <span />
        </div>
        <div className="empty-queue">
          <Search />
          <h3>Belum ada data pada ruang ini.</h3>
          <p>
            {section === "rekomendasi"
              ? "Rekomendasi muncul setelah seluruh biodata dan verifikasi disetujui."
              : "Item baru akan muncul otomatis ketika membutuhkan tindakan Anda."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function DashboardSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ bagian?: string }>;
}) {
  const { section } = await params;
  const query = await searchParams;
  const { user } = await requireSession();
  const allowed = navForRole(user.role).some(
    (item) => item.href === `/dashboard/${section}`,
  );
  if (!allowed) notFound();
  const copy = sectionCopy[section] ?? {
    eyebrow: "RUANG KERJA",
    title: section.replaceAll("-", " "),
    body: "Kelola informasi dan tindakan yang menjadi kewenangan Anda pada ruang ini.",
  };
  return (
    <>
      <header className="module-heading">
        <div>
          <p className="mono">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </div>
        <Link href="/dashboard/panduan" className="app-secondary">
          <FileText /> Lihat panduan
        </Link>
      </header>
      {section === "biodata" ? (
        <BiodataModule
          selectedKey={query.bagian ?? "profile"}
          completed={
            new Set(
              (
                await retryTransientRead(() =>
                  db
                    .select({ key: profileSections.key })
                    .from(profileSections)
                    .where(eq(profileSections.userId, user.id)),
                )
              ).map((item) => item.key),
            )
          }
          role={user.role}
        />
      ) : (
        <QueueModule section={section} />
      )}
    </>
  );
}
