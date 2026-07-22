# Platform Ta'aruf

Platform ta'aruf digital yang dirancang untuk memfasilitasi proses menuju pernikahan dengan alur terarah, keterlibatan wali, pendampingan mediator, dan perlindungan data pribadi.

## Status

Repository ini masih berada pada tahap perencanaan produk dan fondasi teknis. Belum ada aplikasi yang dapat dijalankan.

Dokumen konsep utama tersedia di [Konsep Platform Ta'aruf Berbasis Syariat Islam](./Konsep_Platform_Taaruf_Berbasis_Syariat_Islam-Revisi_Biodata_Terbaru.md).

## Prinsip Produk

- Satu proses ta'aruf aktif untuk setiap peserta.
- Persetujuan bertahap: peserta akhwat dan wali harus sama-sama menyetujui sebelum ta'aruf aktif.
- Tidak ada swipe, chat bebas, feed, atau pertukaran kontak otomatis.
- Data dibuka bertahap sesuai fase proses dan persetujuan pemilik data.
- Foto hanya digunakan untuk verifikasi pada tahap awal; pembukaan kepada calon bersifat terbatas dan tercatat.
- Admin dan mediator menjalankan SOP; prinsip syariah dan etik ditetapkan oleh Dewan Syariah dan Etik Platform.

## Rencana Stack

- Next.js
- PostgreSQL (Neon untuk pengembangan/pilot)
- Drizzle ORM
- Resend untuk email transaksional
- UploadThing hanya untuk aset yang sesuai kebijakan privasi; dokumen identitas harus memakai penyimpanan privat dengan akses terbatas
- VPS untuk deployment produksi awal

## Konfigurasi Lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi seluruh nilai lingkungan di komputer lokal.
3. Jangan pernah commit `.env.local`, kredensial database, token email, token upload, maupun akses VPS.

## Variabel Lingkungan

| Variabel | Kegunaan |
| --- | --- |
| `RESEND_API_KEY` | Mengirim email transaksional. |
| `DATABASE_URL` | Koneksi PostgreSQL. |
| `UPLOADTHING_TOKEN` | Token UploadThing. |
| `UPLOADTHING_SECRET` | Secret UploadThing. |
| `UPLOADTHING_APP_ID` | App ID UploadThing. |

## Roadmap

1. Sahkan SOP versi pertama bersama Dewan Syariah dan Etik.
2. Susun DPIA, inventaris data, retensi data, dan matriks kontrol akses.
3. Rancang state machine proses ta'aruf, consent, audit log, dan peran pengguna.
4. Bangun fondasi Next.js, autentikasi, RBAC, database, dan deployment aman.
5. Bangun MVP onboarding, biodata bertahap, verifikasi, matching terbatas, serta workflow ta'aruf.
6. Jalankan pilot tertutup, audit keamanan/privasi, lalu lakukan peluncuran bertahap.

## Keamanan Data

Platform ini akan memproses data pribadi dan data sensitif. Setiap perubahan fitur harus mengikuti kebijakan akses berbasis peran, consent yang dapat dibuktikan, audit trail, dan SOP yang berlaku. Hindari menyimpan atau membagikan dokumen identitas sebagai file publik.
