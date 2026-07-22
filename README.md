# Platform Ta’aruf Sunnah

Lembaga ta’aruf digital berbasis Next.js yang memfasilitasi proses menuju pernikahan secara terarah, melibatkan wali dan mediator, serta membatasi pembukaan data berdasarkan tahap dan kewenangan.

## Kapabilitas

- Dashboard berbasis role untuk peserta, wali, mediator, admin ikhwan/akhwat, dan super admin.
- Autentikasi email/password, verifikasi email, reset password, session database, dan OTP kedua untuk staf.
- Biodata bertahap, tiga referensi, progres verifikasi, dan pembatasan akses data sensitif.
- Matching dengan hard filter dan skor yang dapat dijelaskan.
- Workflow pengajuan, consent peserta, approval wali, dialog terarah, nazhor, khitbah, hingga pengarsipan.
- Penyimpanan dokumen privat terenkripsi di luar webroot dengan antrean antivirus dan OCR.
- Notifikasi, moderasi, policy versioning, dan audit trail.

## Stack

- Next.js 16, React 19, TypeScript
- Neon PostgreSQL dan Drizzle ORM
- Better Auth
- Resend
- Vitest
- VPS Ubuntu, Nginx, dan systemd

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Gunakan Node.js 22 atau versi kompatibel dengan Next.js 16. Isi seluruh variabel pada `.env.local`; jangan commit file tersebut.

## Variabel Lingkungan

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL Neon. |
| `RESEND_API_KEY` | Verifikasi email, reset password, notifikasi, dan OTP staf. |
| `BETTER_AUTH_SECRET` | Secret session produksi minimal 32 byte. |
| `BETTER_AUTH_URL` | Origin aplikasi, misalnya `https://platformtaarufsunnah.my.id`. |
| `PRIVATE_STORAGE_PATH` | Direktori privat di luar webroot. |
| `DOCUMENT_ENCRYPTION_KEY` | Kunci enkripsi dokumen dan hasil OCR. |
| `NIK_HMAC_KEY` | Kunci fingerprint NIK untuk deteksi duplikat. |

Token UploadThing tetap tersedia untuk aset yang tidak sensitif, tetapi KTP, foto verifikasi, dan foto peserta tidak boleh disimpan sebagai aset publik.

## Perintah

```bash
npm run dev              # development server
npm run build            # production build dan type-check
npm test                 # unit test
npm run db:generate      # membuat migration Drizzle
npm run db:migrate       # menjalankan migration
npm run worker:documents # worker antivirus dan OCR
```

Worker dokumen membutuhkan `clamav`, `tesseract-ocr`, dan data bahasa Indonesia. File systemd tersedia di `deploy/` dan menjalankan worker dengan CPU/RAM limit terpisah dari web process.

## Prinsip Keamanan

- Satu peserta hanya boleh memiliki satu proses ta’aruf aktif.
- Consent peserta dan wali dicatat terpisah dengan versi SOP.
- Foto dan data sensitif tidak dibuka otomatis.
- Dokumen identitas disimpan terenkripsi, tidak memiliki URL publik, dan setiap view diaudit.
- Admin gender hanya menangani peserta yang menjadi wilayah kerjanya; mediator hanya melihat proses yang ditugaskan.

Konsep produk lengkap tersedia di [dokumen konsep](./Konsep_Platform_Taaruf_Berbasis_Syariat_Islam-Revisi_Biodata_Terbaru.md).
