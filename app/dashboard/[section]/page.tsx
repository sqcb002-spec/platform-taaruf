import Link from "next/link";
import {
  ArrowRight,
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
import { saveProfileCore } from "@/app/dashboard/actions";

const biodataSections = [
  "Profil utama",
  "Foto & identitas",
  "Gambaran fisik",
  "Gambaran diri",
  "Keluarga",
  "Pendidikan",
  "Pengalaman",
  "Ibadah & pemahaman",
  "Persiapan pernikahan",
  "Harapan ke depan",
  "Kriteria fisik",
  "Kriteria non-fisik",
  "Pertanyaan pasangan",
  "Karakter & emosi",
  "Pola hidup",
  "Pengalaman hidup",
  "Tiga referensi",
];

function BiodataModule() {
  return (
    <div className="biodata-layout">
      <aside className="section-progress">
        <div>
          <strong>32%</strong>
          <span>6 dari 17 bagian</span>
        </div>
        {biodataSections.map((label, index) => (
          <button
            key={label}
            className={index === 0 ? "current" : index < 5 ? "complete" : ""}
          >
            <span>{index < 5 ? <Check /> : index + 1}</span>
            {label}
            <ChevronRight />
          </button>
        ))}
      </aside>
      <section className="form-card">
        <header>
          <div>
            <p className="mono">BAGIAN 01</p>
            <h2>Profil utama</h2>
            <p>
              Data identitas dasar. Kandidat hanya melihat bentuk ringkas sesuai
              tahap.
            </p>
          </div>
          <span className="autosave">
            <span /> Tersimpan otomatis
          </span>
        </header>
        <form className="profile-form" action={saveProfileCore}>
          <div className="field-grid">
            <label>
              Username
              <input name="username" defaultValue="ahmad_fulan" required />
            </label>
            <label>
              Jenis kelamin
              <select name="gender" defaultValue="Ikhwan">
                <option>Ikhwan</option>
                <option>Akhwat</option>
              </select>
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
              <input
                name="province"
                placeholder="Contoh: Jawa Barat"
                required
              />
            </label>
            <label>
              Kota/kabupaten
              <input name="city" placeholder="Domisili saat ini" required />
            </label>
            <label>
              Manhaj
              <input
                name="manhaj"
                placeholder="Jelaskan secara ringkas"
                required
              />
            </label>
            <label>
              Suku
              <input name="ethnicity" required />
            </label>
            <label>
              Tinggi badan
              <div className="unit-input">
                <input
                  name="heightCm"
                  type="number"
                  min="120"
                  max="230"
                  required
                />
                <span>cm</span>
              </div>
            </label>
            <label>
              Berat badan
              <div className="unit-input">
                <input
                  name="weightKg"
                  type="number"
                  min="30"
                  max="250"
                  required
                />
                <span>kg</span>
              </div>
            </label>
          </div>
          <label>
            Tempat dan bidang pekerjaan
            <textarea
              name="occupation"
              rows={3}
              required
              placeholder="Jelaskan bidang pekerjaan tanpa membuka alamat kantor kepada kandidat."
            />
          </label>
          <div className="sensitive-note">
            <ShieldCheck />
            <div>
              <strong>Visibilitas data dijaga bertahap</strong>
              <p>
                Alamat lengkap, kontak, dan dokumen identitas tidak ditampilkan
                pada profil kandidat.
              </p>
            </div>
          </div>
          <footer>
            <button type="button" className="app-secondary">
              Simpan sebagai draf
            </button>
            <button className="app-primary">
              Simpan & lanjutkan <ArrowRight />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function QueueModule({ section }: { section: string }) {
  const labels =
    section === "rekomendasi"
      ? ["TS-4A19C2", "TS-82D7B1", "TS-118FE0"]
      : ["TS-029AC1", "TS-44FA20", "TS-791EC8"];
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
        {labels.map((code, index) => (
          <div className="data-row" key={code}>
            <span>
              <strong>{code}</strong>
              <small>
                {section === "rekomendasi"
                  ? `${84 - index * 5}% cocok`
                  : "Masuk hari ini"}
              </small>
            </span>
            <span>
              <em className={index === 0 ? "status-warn" : "status-neutral"}>
                {index === 0 ? "Perlu tindakan" : "Menunggu"}
              </em>
            </span>
            <span>
              {section === "rekomendasi"
                ? "Jawa Barat · 26–30 tahun"
                : "Biodata dan identitas"}
            </span>
            <span>
              <Clock3 /> {index + 1} hari
            </span>
            <span>
              <button aria-label={`Buka ${code}`}>
                <ChevronRight />
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
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
        <BiodataModule />
      ) : (
        <QueueModule section={section} />
      )}
    </>
  );
}
