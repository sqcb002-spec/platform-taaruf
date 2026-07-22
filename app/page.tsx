import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { SiteHeader } from "./components/SiteHeader";
import "./home.css";

const stages = [
  {
    n: "1.0",
    title: "Siapkan biodata",
    text: "Peserta mengisi biodata bertahap, kriteria pasangan, dan tiga referensi. Bagian wajib diperiksa sebelum pencarian dibuka.",
    note: "Verifikasi identitas · Progres tersimpan",
    tone: "pear",
  },
  {
    n: "2.0",
    title: "Temukan yang relevan",
    text: "Sistem hanya memperlihatkan kandidat yang sesuai aturan dan kriteria. Tidak ada katalog terbuka, swipe, like, atau foto publik.",
    note: "Profil anonim · Progressive disclosure",
    tone: "cyan",
  },
  {
    n: "3.0",
    title: "Sepakati proses",
    text: "Akhwat memberikan keputusan terlebih dahulu. Jika tertarik, wali memberi persetujuan terpisah. Keduanya harus sepakat.",
    note: "Dual consent · Satu proses aktif",
    tone: "coral",
  },
  {
    n: "4.0",
    title: "Dampingi sampai jelas",
    text: "Mediator menjaga sesi tanya jawab, pemeriksaan referensi, nazhor bersama wali, hingga keputusan lanjut atau selesai.",
    note: "Mediator · Nazhor · Khitbah",
    tone: "mint",
  },
];
const principles = [
  [
    LockKeyhole,
    "Privasi bertahap",
    "Data dibuka berdasarkan tahap, tujuan, dan persetujuan. Identitas serta dokumen tidak menjadi berkas bebas unduh.",
  ],
  [
    UsersRound,
    "Wali tetap berperan",
    "Wali memiliki akses ringan untuk keputusan dan jadwal yang berkaitan dengan waliannya.",
  ],
  [
    HeartHandshake,
    "Dialog terarah",
    "Komunikasi berlangsung lewat pertanyaan relevan dan pendampingan, bukan chat bebas tanpa batas.",
  ],
  [
    ShieldCheck,
    "Keputusan tercatat",
    "Persetujuan, perubahan akses, dan tindakan petugas meninggalkan jejak audit yang dapat ditinjau.",
  ],
];
export default function Home() {
  return (
    <main className="home">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="mono">IKHTIAR SERIUS · PROSES TERJAGA</p>
          <h1>Menuju pernikahan dengan arah yang jelas.</h1>
          <p className="hero-lead">
            Sarana ta’aruf digital untuk muslim dan muslimah yang ingin mengenal
            calon secara tertib, melibatkan wali, dan menjaga kehormatan kedua
            pihak.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-lg" href="/daftar">
              Mulai dengan biodata <ArrowRight size={19} />
            </Link>
            <a className="text-link" href="#proses">
              Lihat cara kerja <ArrowDown size={17} />
            </a>
          </div>
          <div className="hero-trust">
            <span>
              <Check />
              Tanpa swipe
            </span>
            <span>
              <Check />
              Tanpa chat bebas
            </span>
            <span>
              <Check />
              Satu proses aktif
            </span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Ilustrasi alur ta’aruf yang melibatkan peserta, wali, dan mediator"
        >
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="path-card card-you">
            <span>Peserta</span>
            <b>Biodata siap</b>
            <i>
              <UserRoundCheck />
            </i>
          </div>
          <div className="path-card card-wali">
            <span>Wali</span>
            <b>Persetujuan</b>
            <i>
              <UsersRound />
            </i>
          </div>
          <div className="path-card card-med">
            <span>Mediator</span>
            <b>Pendampingan</b>
            <i>
              <HeartHandshake />
            </i>
          </div>
          <div className="akad-mark">
            <span>Tujuan</span>
            <b>Akad</b>
          </div>
          <div className="character" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>
      </section>
      <section id="himbauan" className="himbauan">
        <div>
          <span className="mono">SEBELUM MEMULAI</span>
          <h2>Ta’aruf bukan pacaran yang diberi nama baru.</h2>
        </div>
        <p>
          Platform membatasi interaksi agar setiap langkah tetap dekat dengan
          tujuan pernikahan. Peserta wajib jujur, menjaga data calon, tidak
          bertukar kontak di luar mekanisme, dan menghormati keputusan untuk
          berhenti.
        </p>
        <Link href="#proses" className="text-link">
          Pahami alurnya <ArrowRight size={17} />
        </Link>
      </section>
      <section id="tentang" className="purpose">
        <div className="purpose-lead">
          <p className="mono">KENAPA KAMI ADA</p>
          <h2>Teknologi membantu proses. Keluarga tetap memegang peran.</h2>
          <p>
            Platform ini dirancang sebagai lembaga ta’aruf digital, bukan media
            sosial pencarian pasangan. Admin menjalankan operasional, mediator
            menjaga pembahasan, dan Dewan Syariah & Etik menetapkan SOP.
          </p>
        </div>
        <div className="mission-stack">
          <article>
            <span>Visi</span>
            <h3>Keluarga muslim dimulai dari proses yang bertanggung jawab.</h3>
          </article>
          <article>
            <span>Misi</span>
            <ul>
              <li>Menjaga privasi dan kehormatan peserta.</li>
              <li>Memudahkan keterlibatan wali serta mediator.</li>
              <li>Membuat keputusan dan akses data transparan.</li>
            </ul>
          </article>
        </div>
      </section>
      <section id="prinsip" className="principles">
        <div className="section-heading">
          <span className="mono">EMPAT PEGANGAN</span>
          <h2>Aman bukan berarti tertutup. Terarah bukan berarti memaksa.</h2>
        </div>
        <div className="principle-list">
          {principles.map(([Icon, title, text], i) => (
            <article key={String(title)}>
              <span className="principle-no">0{i + 1}</span>
              <div>
                <Icon />
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="proses" className="workflow">
        <div className="section-heading">
          <span className="mono">DARI NIAT KE KEPUTUSAN</span>
          <h2>Empat tahap. Setiap tahap punya batas.</h2>
          <p>
            Peserta selalu tahu apa yang sedang terjadi, siapa yang dapat
            melihat data, dan keputusan apa yang perlu diambil.
          </p>
        </div>
        <ol>
          {stages.map((stage) => (
            <li key={stage.n} className={`stage stage-${stage.tone}`}>
              <div className="stage-number">{stage.n}</div>
              <div className="stage-copy">
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
                <span>{stage.note}</span>
              </div>
              <div className="stage-visual" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="role-entry">
        <div>
          <span className="mono">SATU PLATFORM · AKSES BERBEDA</span>
          <h2>Setiap orang melihat apa yang menjadi amanahnya.</h2>
        </div>
        <div className="role-links">
          <Link href="/dashboard">
            <span>Peserta</span>
            <b>Lengkapi biodata dan ikuti proses</b>
            <ArrowRight />
          </Link>
          <Link href="/dashboard">
            <span>Wali</span>
            <b>Tinjau calon dan berikan keputusan</b>
            <ArrowRight />
          </Link>
          <Link href="/dashboard">
            <span>Mediator & admin</span>
            <b>Dampingi, verifikasi, dan awasi</b>
            <ArrowRight />
          </Link>
        </div>
      </section>
      <section id="bantuan" className="help">
        <div>
          <span className="mono">BUTUH PENJELASAN?</span>
          <h2>Mulai dengan membaca. Lanjutkan ketika sudah siap.</h2>
        </div>
        <div>
          <p>
            Pelajari aturan privasi, tahapan ta’aruf, dan tanggung jawab peserta
            sebelum membuat akun.
          </p>
          <a
            className="text-link"
            href="mailto:admin@platformtaarufsunnah.my.id"
          >
            Hubungi admin <ArrowRight size={17} />
          </a>
        </div>
      </section>
      <footer className="statement-footer">
        <p>Menjaga proses adalah bagian dari menjaga tujuan.</p>
        <div className="footer-meta">
          <Link href="/" className="wordmark">
            <span className="wordmark-mark">ت</span>
            <span>
              Ta’aruf <b>Sunnah</b>
            </span>
          </Link>
          <nav>
            <a href="#tentang">Tentang</a>
            <a href="#proses">Cara kerja</a>
            <a href="#prinsip">Privasi</a>
            <a href="mailto:admin@platformtaarufsunnah.my.id">Kontak</a>
          </nav>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
