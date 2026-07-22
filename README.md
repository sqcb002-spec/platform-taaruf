# Platform Ta’aruf Sunnah

Platform ta’aruf digital yang memfasilitasi ikhtiar menuju pernikahan secara terarah, melibatkan wali dan mediator, serta membuka data berdasarkan tahap dan kewenangan.

Repository ini menggunakan monorepo dengan landing page, dashboard, dan backend yang dapat dirilis secara independen. Dokumen konsep produk lengkap tersedia di [Konsep Platform Ta’aruf](./Konsep_Platform_Taaruf_Berbasis_Syariat_Islam-Revisi_Biodata_Terbaru.md).

## Arsitektur

```text
platformtaarufsunnah.my.id             Next.js landing (Vercel)
dashboard.platformtaarufsunnah.my.id   Next.js dashboard (Vercel)
api.platformtaarufsunnah.my.id         Express API (VPS + Nginx)
                                         ├── Better Auth
                                         ├── Drizzle + Neon PostgreSQL
                                         ├── Resend
                                         └── private document worker
```

Dashboard tidak mengakses database dari React Server Components. Seluruh data operasional diambil melalui API dengan loading, retry, dan error state yang tidak menjatuhkan keseluruhan halaman.

## Kapabilitas

- Dashboard berbasis role untuk peserta, wali, mediator, admin ikhwan/akhwat, dan super admin.
- Better Auth dengan email/password, verifikasi email, reset password, session database, dan OTP staf.
- Biodata bertahap, data sensitif terenkripsi, progres kelengkapan, dan verifikasi identitas.
- Workflow pengajuan, persetujuan peserta dan wali, mediator, nazhor, khitbah, serta audit trail.
- Dokumen privat terenkripsi di luar webroot, berikut worker antivirus dan OCR.
- API error envelope, request logging, CORS allowlist, security headers, dan health checks.

## Struktur Repository

```text
apps/
  landing/      Landing page Next.js, port 3000
  dashboard/    Dashboard dan halaman autentikasi Next.js, port 3001
  api/          Express API dan document worker, port 3003
deploy/         Unit systemd dan konfigurasi Nginx
drizzle/        Riwayat migration PostgreSQL
```

## Prasyarat

- Node.js 22 atau lebih baru
- npm
- PostgreSQL/Neon yang telah menjalankan migration
- Untuk worker: ClamAV, Tesseract OCR, dan language pack Indonesia

Backend dan database sebaiknya berada di region yang berdekatan. Deployment VPS Jakarta dirancang menggunakan Neon Singapore untuk menghindari latensi dan timeout lintas benua.

## Instalasi

```bash
npm install
cp .env.example .env.local
```

Isi variabel environment menggunakan secret development. Jangan commit `.env.local` atau kredensial produksi.

## Menjalankan Lokal

Jalankan setiap proses di terminal terpisah:

```bash
npm run dev:landing
npm run dev:dashboard
npm run dev:api
```

Alamat lokal:

- Landing: `http://localhost:3000`
- Dashboard: `http://localhost:3001`
- API: `http://localhost:3003`
- Health check: `http://localhost:3003/health`
- Database readiness: `http://localhost:3003/ready`

## Konfigurasi

| Variabel | Digunakan oleh | Kegunaan |
| --- | --- | --- |
| `DATABASE_URL` | API, worker | Koneksi PostgreSQL Neon. |
| `BETTER_AUTH_SECRET` | API | Secret session minimal 32 karakter. |
| `API_PUBLIC_URL` | API | Origin publik API. |
| `DASHBOARD_ORIGIN` | API | Origin dashboard yang diizinkan oleh CORS/auth. |
| `LANDING_ORIGIN` | API | Origin landing yang dipercaya. |
| `NEXT_PUBLIC_API_URL` | Dashboard | Alamat API dari browser. |
| `NEXT_PUBLIC_DASHBOARD_URL` | Landing | Alamat dashboard untuk CTA dan login. |
| `NEXT_PUBLIC_LANDING_URL` | Dashboard | Alamat landing untuk navigasi balik. |
| `RESEND_API_KEY` | API | Email verifikasi, reset password, dan OTP. |
| `EMAIL_FROM` | API | Identitas pengirim email terverifikasi. |
| `PRIVATE_STORAGE_PATH` | API, worker | Direktori dokumen privat di luar webroot. |
| `DOCUMENT_ENCRYPTION_KEY` | API, worker | Kunci enkripsi dokumen dan hasil OCR. |
| `NIK_HMAC_KEY` | API | Kunci fingerprint NIK. |

## Perintah

```bash
npm run build             # build seluruh workspace
npm run build:landing     # build landing saja
npm run build:dashboard   # build dashboard saja
npm run build:api         # bundle Express API
npm test                  # unit test seluruh workspace
npm run lint              # lint/type-check seluruh workspace
npm run db:migrate --workspace=@taaruf/api
npm run worker --workspace=@taaruf/api
```

## Deployment

Landing dan dashboard merupakan dua project Vercel dengan root directory masing-masing `apps/landing` dan `apps/dashboard`.

API berjalan pada `127.0.0.1:3003`, dijaga systemd, dan diteruskan Nginx melalui `api.platformtaarufsunnah.my.id`. File siap pakai tersedia di `deploy/`:

- `platform-taaruf-api.service`
- `platform-taaruf-v2-worker.service`
- `nginx-platform-taaruf-api.conf`

Lakukan deployment ke port dan direktori baru terlebih dahulu. Hentikan aplikasi lama dan hapus artefaknya hanya setelah health check, auth, biodata, upload, dan smoke test production lolos.

## Batas Keamanan

- Satu peserta hanya dapat memiliki satu proses ta’aruf aktif.
- Persetujuan peserta dan wali dicatat terpisah dengan versi SOP.
- Foto dan data sensitif tidak dibuka otomatis.
- Dokumen identitas tidak memiliki URL publik dan setiap akses diaudit.
- Cookie session hanya dikirim melalui HTTPS dan origin API dibatasi eksplisit.
- Admin gender dan mediator hanya memperoleh data yang menjadi kewenangannya.
