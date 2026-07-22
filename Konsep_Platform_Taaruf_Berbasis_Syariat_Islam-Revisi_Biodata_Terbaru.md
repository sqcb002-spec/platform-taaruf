# **Konsep Website Ta'aruf Berbasis Syariat Islam**

## Pembaruan alur proses, biodata terperinci, gambaran fisik, pola hidup, referensi peserta, nazhor, status akun, dan tutorial

*Pembaruan: 22 Juli 2026*

Assalamu'alaikum warahmatullahi wabarakatuh.

Saya ingin menyampaikan konsep awal mengenai website ta'aruf yang akan kita bangun. Tujuan utama platform ini bukan menjadi aplikasi pencarian jodoh seperti kebanyakan, melainkan menjadi **media ta'aruf yang mengikuti syariat Islam**, sehingga proses menuju pernikahan dapat dilakukan dengan lebih terarah, aman, dan menjaga adab.

Dokumen ini memuat konsep utama, keputusan proses yang telah diarahkan, serta beberapa poin yang masih perlu diklarifikasi agar implementasinya matang secara syariat maupun operasional.

Pada pembaruan ini, konsep turut dilengkapi dengan alur satu calon aktif, data referensi minimal tiga orang, spesifikasi biodata yang lebih terperinci, tahap nazhor yang melibatkan wali, aktivasi atau nonaktivasi akun secara mandiri, pusat tutorial, serta modul aplikasi seperti dashboard, profil peserta, inbox, aktivitas ta'aruf, status akun, membership, walimah, pengaturan akun, dan pembagian peran admin.

## **Latar Belakang**

Saat ini banyak platform pencarian pasangan yang mengadopsi konsep media sosial atau dating app, seperti swipe, chat bebas, upload foto terbuka, hingga interaksi tanpa batas. Model seperti ini sering kali tidak sejalan dengan konsep ta'aruf dalam Islam.

Karena itu, platform ini akan memiliki pendekatan yang berbeda.

Website ini dibangun sebagai **Lembaga Ta'aruf Digital**, yaitu platform yang membantu mempertemukan calon pasangan dengan proses yang terstruktur, transparan, serta tetap menjaga batasan syariat.

Fokus utamanya bukan memperbanyak interaksi, melainkan mempermudah proses menuju pernikahan.

---

# **Alur Pengguna**

### **Ringkasan Alur Utama**

Pengisian biodata → penentuan kriteria dan pemilihan calon → pengajuan serta persetujuan ta'aruf → proses ta'aruf terarah dan pemeriksaan referensi → nazhor bersama wali → khitbah → akad nikah → pengarsipan akun.

Peserta hanya dapat menjalani satu proses ta'aruf aktif pada satu waktu. Ketika telah fokus pada satu calon, akses memilih calon lain dihentikan sampai proses tersebut selesai.

## **1\. Pendaftaran dan Verifikasi**

Calon peserta membuat akun kemudian melakukan verifikasi identitas.

Data yang dapat diverifikasi antara lain:

* Identitas diri

* Nomor HP

* Email

* KTP (opsional sesuai kebijakan)

* Kontak wali (khusus akhwat)

* Foto identitas untuk verifikasi admin

Tahap ini bertujuan memastikan seluruh peserta merupakan pengguna asli dan meminimalkan akun palsu.

**Catatan Klarifikasi:**

* Perlu ditentukan apakah foto profil akan digunakan dalam sistem atau tidak.

* Jika digunakan, perlu aturan jelas: apakah foto hanya untuk verifikasi admin, atau dapat ditampilkan ke kandidat pada tahap tertentu (misalnya setelah mutual approval) sesuai prinsip nazhar.

---

## **2\. Pengisian Biodata**

Peserta kemudian mengisi biodata secara lengkap.

Bukan hanya informasi umum seperti usia dan pekerjaan, tetapi juga informasi yang benar-benar dibutuhkan dalam proses ta'aruf, misalnya:

* Pendidikan

* Pekerjaan

* Domisili

* Status pernikahan

* Hafalan Al-Qur'an

* Kajian yang diikuti

* Manhaj

* Kebiasaan ibadah

* Karakter diri

* Riwayat kesehatan (opsional)

* Visi keluarga

* Target pendidikan anak

* Rencana tempat tinggal

* dan informasi penting lainnya.

Rincian form biodata mengikuti spesifikasi pada bagian Modul dan Fitur Sistem, mencakup biodata utama, gambaran fisik, gambaran diri, pendidikan, ibadah, keluarga, harapan ke depan, persiapan pernikahan, kriteria pasangan, pertanyaan pasangan ta'aruf, karakter dan pengelolaan emosi, pola hidup, pengalaman hidup, serta rencana masa depan.

### **Referensi Peserta**

Selain biodata pribadi, peserta wajib memberikan informasi minimal tiga orang yang dianggap mengenal peserta dengan baik sebagai referensi proses ta'aruf.

* Tetangga

* Rekan kerja

* Rekan bisnis

* Teman mengaji

* Saudara

Data minimal yang disarankan meliputi nama, hubungan dengan peserta, nomor kontak, dan lama mengenal peserta.

Informasi referensi digunakan sebagai bahan pendukung untuk mengenali karakter, lingkungan, dan keseharian peserta. Akses terhadap data ini dibatasi kepada admin atau mediator yang berkepentingan.

Dengan biodata yang lengkap, proses seleksi menjadi lebih objektif.

Dalam implementasinya, pengisian biodata sebaiknya dibuat bertahap agar peserta tidak menghadapi satu formulir yang terlalu panjang. Setiap bagian memiliki indikator progres dan status kelengkapan.

Peserta baru dapat menggunakan fitur pencarian atau pengajuan ta'aruf setelah bagian wajib selesai diisi dan, jika diperlukan, telah diverifikasi oleh admin.

---

## **3\. Kriteria Calon Pasangan**

Setelah biodata selesai, peserta menentukan kriteria pasangan yang diharapkan.

Misalnya:

* Rentang usia

* Domisili

* Pendidikan

* Manhaj

* Status

* Hafalan Al-Qur'an

* Pekerjaan

* Kesiapan hijrah

* dan lain-lain.

Sistem akan menggunakan data tersebut untuk memberikan rekomendasi pasangan yang sesuai.

---

## **4\. Proses Matching dan Pemilihan Calon**

Berbeda dengan aplikasi dating, pengguna tidak dapat melihat seluruh daftar peserta.

Sistem hanya menampilkan kandidat yang memiliki tingkat kecocokan tinggi berdasarkan biodata dan kriteria yang telah diisi.

Dengan demikian proses menjadi lebih fokus dan menjaga privasi peserta.

Peserta hanya boleh menjalani satu proses ta'aruf aktif pada satu waktu.

Ketika satu calon telah dipilih dan pengajuan ta'aruf disetujui, fitur pencarian atau pemilihan calon lain dinonaktifkan sementara agar kedua pihak fokus pada proses yang sedang berjalan.

Apabila proses telah memasuki fase nazhor dan seterusnya, sistem mengunci akses pencarian serta memfokuskan peserta sepenuhnya pada calon yang akan dinazhor.

**Catatan Klarifikasi:**

* Perlu disiapkan mekanisme fallback untuk mengatasi kondisi "cold start" (jumlah user masih sedikit).

* Misalnya dengan menurunkan threshold kecocokan secara bertahap atau tetap menampilkan kandidat dengan kecocokan minimum tertentu agar pengguna tetap mendapatkan opsi.

---

## **5\. Pengajuan Ta'aruf**

Jika seorang peserta merasa cocok terhadap kandidat yang direkomendasikan, ia dapat mengajukan permohonan ta'aruf.

Pengajuan ini tidak langsung membuka komunikasi antara kedua belah pihak.

Permohonan akan melalui proses persetujuan sesuai mekanisme yang ditetapkan.

Setelah permohonan diterima, status kedua peserta berubah menjadi Sedang Ta'aruf dan akses mencari calon lain dihentikan sampai proses selesai, ditolak, atau salah satu pihak memilih mundur.

---

## **6\. Persetujuan**

Pihak yang menerima permohonan memiliki beberapa pilihan:

* Menerima

* Menolak

* Meminta waktu untuk istikharah terlebih dahulu

Tidak ada tekanan maupun kewajiban menerima setiap permohonan.

**Catatan Klarifikasi:**

* Perlu ditentukan secara eksplisit siapa yang berhak memberikan persetujuan:

  * Apakah cukup peserta sendiri?

  * Ataukah untuk akhwat wajib melibatkan wali dalam proses approval?

* Hal ini penting agar konsisten dengan prinsip syariat yang ingin dijaga sejak awal.

---

## **7\. Pendampingan oleh Mediator**

Setelah kedua pihak sepakat, proses ta'aruf dilakukan dengan pendamping.

Mediator dapat berupa:

* Admin

* Ustadz

* Ustadzah

* Konselor

* Perwakilan lembaga

Peran mediator adalah menjaga adab komunikasi, memastikan pembahasan tetap sesuai tujuan, serta menghindari interaksi yang tidak diperlukan.

Dalam proses pendampingan, admin atau mediator juga dapat meninjau dan, sesuai kebijakan lembaga, menghubungi minimal tiga referensi yang diberikan peserta.

Hasil informasi referensi menjadi bahan pertimbangan internal dan tidak ditampilkan secara terbuka kepada peserta lain.

**Catatan Klarifikasi:**

* Perlu ditentukan model operasional mediator:

  * Apakah direkrut internal?

  * Kerja sama dengan lembaga eksternal?

  * Atau berbasis volunteer?

* Hal ini penting karena mediator berpotensi menjadi bottleneck jika jumlah peserta meningkat.

---

## **8\. Sesi Tanya Jawab Terarah**

Platform tidak menyediakan fitur chat bebas.

Sebagai gantinya tersedia sistem pertanyaan dan jawaban yang terstruktur.

Contohnya:

* Visi keluarga

* Target pendidikan anak

* Prinsip keuangan

* Tempat tinggal

* Rencana setelah menikah

* Komitmen dakwah

* Pembagian peran suami istri

Dengan model ini pembahasan tetap fokus pada persiapan pernikahan.

---

## **9\. Nazhor**

Apabila kedua pihak merasa cocok dan ingin melanjutkan, proses masuk ke tahap nazhor.

Nazhor dilaksanakan dengan melibatkan wali, serta dapat didampingi mahram atau mediator sesuai kebutuhan dan kebijakan lembaga.

* Kedua pihak menentukan dan menyepakati waktu nazhor.

* Kedua pihak menentukan dan menyepakati tempat nazhor.

* Sistem mencatat jadwal, lokasi, pihak yang terlibat, dan status pelaksanaan nazhor.

* Selama tahap nazhor dan proses setelahnya, fitur pencarian pasangan tetap dinonaktifkan.

**Catatan Klarifikasi:**

* Perlu ditentukan siapa yang bertanggung jawab atas logistik pertemuan:

  * Apakah difasilitasi oleh platform/lembaga?

  * Atau menjadi tanggung jawab masing-masing keluarga di luar sistem?

---

## **10\. Khitbah, Akad Nikah, dan Penyelesaian Proses**

Jika proses nazhor berjalan baik dan kedua keluarga sepakat melanjutkan, status peserta dapat berubah menjadi:

* Khitbah

* Persiapan Akad Nikah

* Menikah

Setelah akad nikah dikonfirmasi, status peserta berubah menjadi Menikah dan akun diarsipkan sehingga tidak lagi muncul dalam proses pencarian pasangan.

Pada tahap khitbah dan persiapan akad nikah, platform dapat mencatat tanggal khitbah, rencana akad, rencana walimah bila diperlukan, status penyelesaian proses, serta konfirmasi bahwa kedua peserta tidak lagi aktif dalam pencarian.

**Catatan Klarifikasi:**

* Perlu ditentukan bagaimana pengelolaan data untuk proses yang batal:

  * Apakah dihapus, diarsipkan, atau disembunyikan?

* Hal ini penting untuk menjaga privasi dan aib peserta sesuai prinsip syariat.

---

## **11\. Batas Waktu Proses**

Untuk menjaga proses tetap terarah, perlu ditentukan batas waktu ideal dalam setiap tahapan ta'aruf.

**Catatan Klarifikasi:**

* Berapa lama maksimal proses dari awal ta'aruf hingga keputusan?

* Apakah ada sistem reminder atau auto-close jika tidak ada progres?

---

# Modul dan Fitur Sistem

Selain alur utama ta'aruf, referensi sistem yang diberikan menunjukkan bahwa platform membutuhkan sejumlah modul operasional setelah peserta masuk ke dalam akun. Modul berikut menjadi pelengkap agar konsep dapat diterjemahkan menjadi aplikasi yang utuh.

## 1\. Dashboard Pengguna

Dashboard merupakan halaman utama setelah peserta berhasil login. Halaman ini berfungsi sebagai pusat informasi dan navigasi seluruh aktivitas peserta.

* Sapaan personal kepada peserta.

* Status akun dan status verifikasi.

* Informasi bentuk atau tujuan pernikahan sesuai data peserta dan kebijakan lembaga.

* Progres kelengkapan biodata.

* Status proses ta'aruf yang sedang berjalan.

* Jumlah pesan atau notifikasi yang belum dibaca.

* Akses cepat menuju Biodata, Cari Pasangan, Inbox, Aktivitas Ta'aruf, Tutorial, dan Settings.

* Informasi penting, teguran, atau arahan dari admin.

Isi dashboard menyesuaikan status akun. Peserta yang biodatanya belum lengkap, sedang memilih calon, fokus pada satu calon, sedang ta'aruf, menjalani nazhor, telah khitbah, menyiapkan akad, menonaktifkan akun, ditangguhkan, atau telah menikah dapat memperoleh tampilan dan hak akses yang berbeda.

## 2\. Biodata Bertahap dan Progres Kelengkapan

Biodata dibagi menjadi beberapa bagian agar lebih mudah diisi, ditinjau, dan diverifikasi. Struktur awal yang dapat digunakan meliputi:

* Profil

* Foto

* Gambaran Fisik

* Gambaran Diri

* Gambaran Keluarga

* Pendidikan

* Pengalaman

* Ibadah

* Persiapan Pernikahan

* Harapan

* Kriteria Fisik Pasangan

* Kriteria Non-Fisik Pasangan

* Jawaban Pertanyaan Pasangan Ta'aruf

* Karakter dan Pengelolaan Emosi

* Pola Hidup

* Pengalaman Hidup dan Rencana Masa Depan

* Referensi Peserta

Setiap bagian memiliki status seperti Belum Diisi, Sebagian, Lengkap, atau Terverifikasi. Sistem juga dapat menampilkan persentase progres agar peserta mengetahui bagian yang masih harus dilengkapi.

Khusus bagian foto, aksesnya harus mengikuti keputusan syariat dan kebijakan lembaga. Foto dapat dibatasi hanya untuk verifikasi admin atau baru dibuka pada tahap tertentu setelah persetujuan kedua pihak.

### **Spesifikasi Detail Biodata**

Daftar berikut merupakan baseline field terbaru dari arahan atasan. Penentuan field wajib atau opsional, pihak yang dapat melihat setiap jawaban, dan kebutuhan verifikasi masih perlu disahkan sebagai kebijakan lembaga.

#### A. Biodata Utama

• Username

• Jenis Kelamin

• Domisili

• Manhaj

• Tanggal Lahir

• Status Nikah

• Tempat Bekerja

• Suku

• Kota Asal

• Tinggi

• Berat Badan

• Warna Kulit

• Menggunakan Cadar

• Isbal

• Memelihara Janggut

• Riwayat Penyakit

*Catatan: Tinggi dan Berat Badan sebaiknya menggunakan input angka dengan satuan cm dan kg, sedangkan format pilihan Warna Kulit perlu ditetapkan oleh lembaga.*  
*Catatan: Field Menggunakan Cadar ditampilkan secara kondisional untuk peserta akhwat.*  
*Catatan: Field Isbal dan Memelihara Janggut ditampilkan secara kondisional untuk peserta ikhwan.*  
*Catatan: Riwayat Penyakit termasuk data sensitif dan perlu dibatasi aksesnya sesuai peran serta tahap proses.*

#### B. Gambaran Diri

• Moto

• Target Hidup

• Penghargaan

• Hobi

• Hal disukai

• Karakter

• Sifat Positif

• Sifat Negatif

• Poligami

*Catatan: Redaksi dan pilihan jawaban untuk field Poligami perlu ditentukan lebih lanjut agar sesuai konteks peserta ikhwan dan akhwat.*

#### C. Data Pendidikan

Pendidikan formal dicatat per jenjang, sedangkan pendidikan nonformal dapat dibuat sebagai daftar yang dapat ditambah lebih dari satu.  
• SD

• SLTP

• SMU

• Kuliah

• Pendidikan Non Formal

*Catatan: Detail tiap jenjang dapat memuat nama lembaga, jurusan bila ada, tahun masuk, tahun selesai, dan status kelulusan setelah format final disetujui.*

#### D. Data Ibadah dan Pemahaman Agama

Bagian ini memuat pertanyaan pemahaman agama dan kebiasaan ibadah sebagaimana arahan terbaru.  
• Allah berada dimana?

• Hafalan Alquran

• Bacaan Alquran

• Bolehkah melakukan demo?

• Apakah musik Haram?

• Tentang ikhtilath?

• Apa makna Laa ilaha illallah?

• Apakah Alquran Makhluk?

• Apakah Syiah sesat?

• Apakah pelaku Dosa besar kafir?

• Umroh

• Haji

• Sholat 5 Waktu

• Sholat di Masjid

• Tahajjud / Witir

• Puasa

• Duha

• Shodaqoh

• Zakat

• Wakaf

• Infaq

*Catatan: Pertanyaan Allah berada dimana? muncul dua kali pada arahan. Di dalam spesifikasi form dicatat satu kali agar tidak terjadi field ganda.*  
*Catatan: Jenis jawaban perlu diputuskan per pertanyaan, misalnya pilihan terstruktur, frekuensi, jumlah hafalan, atau jawaban uraian.*

#### E. Data Keluarga

Data keluarga sebaiknya menggunakan komponen berulang agar peserta dapat menambah anggota keluarga sesuai kondisi sebenarnya.  
• Ayah: usia, pekerjaan, pendidikan, agama

• Ibu: usia, pekerjaan, agama

• Kakak: usia, pekerjaan, pendidikan, agama

• Kakak Perempuan: usia, pekerjaan, agama, pendidikan, status masih hidup

• Adik

*Catatan: Rincian field untuk Adik belum disebutkan dalam arahan dan perlu dikonfirmasi.*  
*Catatan: Perlu diputuskan apakah status masih hidup juga diterapkan untuk seluruh anggota keluarga atau hanya pada data tertentu.*

#### F. Harapan ke Depan

• Rencana Karir ke depan

• Domisili ke depan

• Keturunan

• Pendidikan Anak

• Keuangan Rumah Tangga

• Peningkatan ilmu agama

• Target jangka pendek

• Target jangka panjang

• Istri boleh bekerja

*Catatan: Setiap item disediakan sebagai pertanyaan dengan kolom jawaban uraian.*

#### G. Persiapan Pernikahan

• Visi Pernikahan

• Misi Pernikahan

• Biaya Pernikahan

• Mahar Pernikahan

• Persiapan Mental

• Pola Asuh Orang Tua

• Hubungan Anggota Keluarga

• Jangka waktu menikah

• Luka Masa Kecil / Batin

*Catatan: Visi, misi, biaya, mahar, persiapan mental, dan jangka waktu menikah disediakan bersama kolom keterangan.*  
*Catatan: Luka Masa Kecil / Batin merupakan data yang sangat sensitif. Jawaban perlu diberi kontrol privasi dan tidak otomatis ditampilkan kepada semua pihak.*

#### H. Kriteria Pasangan yang Dicari

• Usia

• Pendidikan

• Suku

• Pekerjaan

• Domisili

*Catatan: Daftar ini menjadi kriteria minimum dari arahan terbaru dan dapat tetap dilengkapi dengan kriteria lain yang sudah ada pada konsep sebelumnya setelah disetujui.*

#### I. Jawaban Pertanyaan Pasangan Ta'aruf

Bagian ini digunakan untuk menjawab pertanyaan yang berkaitan dengan respons peserta dalam hubungan dan konflik.  
• Bila tidak dapat pasangan yang diinginkan

• Menyalahkan pasangan jika ...

• Bertahan dalam konflik

*Catatan: Redaksi pertanyaan Menyalahkan pasangan jika ... masih belum lengkap pada arahan dan perlu difinalisasi sebelum implementasi.*  
*Catatan: Bentuk jawaban dan apakah pertanyaan dijawab saat pengisian biodata atau ketika proses ta'aruf aktif juga perlu ditentukan.*

#### J. Karakter dan Pengelolaan Emosi

• Karakter

• Test MBTI

• Kondisi Ketika Marah

• Trigger Emosi

• Boundaries

• Pembawaan

*Catatan: Karakter muncul pula pada bagian Gambaran Diri. Perlu diputuskan apakah dijadikan satu field atau dipisahkan antara ringkasan karakter dan penjelasan mendalam.*  
*Catatan: Hasil Test MBTI dicatat sebagai informasi peserta dan status wajib atau opsionalnya perlu ditentukan.*

#### K. Pengalaman Hidup, Pola Hidup, Pembelajaran, dan Masa Depan

• Kesalahan Masa Lalu yang Berkesan untuk Pembelajaran

• Hal Besar yang Pernah Dilalui

• Penyelesaian Masalah yang Pernah Diselesaikan

• Pola Makan

• Pola Tidur

• Pola Olahraga

• Cita-cita / Belum Selesai dengan Diri Sendiri

• Hal yang Ingin Diwujudkan di Masa Depan

*Catatan: Jawaban pada bagian ini berpotensi memuat informasi pribadi yang sensitif, sehingga akses dan riwayat perubahannya perlu dijaga.*

### **Catatan Implementasi Form Biodata**

• Form dibuat bertahap dengan autosave, indikator progres, dan status Belum Diisi, Sebagian, Lengkap, atau Terverifikasi.

• Field dapat menggunakan tipe input teks pendek, uraian panjang, angka, tanggal, pilihan tunggal, pilihan ganda, frekuensi, dan daftar berulang sesuai kebutuhan.

• Field tertentu perlu tampil secara kondisional berdasarkan jenis kelamin dan jawaban sebelumnya.

• Data sensitif seperti riwayat penyakit, luka masa kecil atau batin, trigger emosi, kesalahan masa lalu, data keluarga, serta data fisik tertentu harus memiliki pembatasan akses berbasis peran.

• Tidak seluruh jawaban harus langsung ditampilkan kepada kandidat. Visibilitas dapat dibedakan antara peserta sendiri, admin verifikator, mediator, wali, dan calon pada tahap tertentu.

• Perubahan pada data penting dapat mengembalikan status bagian menjadi Menunggu Verifikasi.

• Sebelum implementasi, lembaga perlu menetapkan field wajib, field opsional, format jawaban, batas panjang jawaban, serta ketentuan verifikasi untuk setiap bagian.

## 3\. Halaman Profil Peserta

Setelah biodata diisi, sistem membentuk halaman profil peserta sebagai ringkasan data yang digunakan selama proses ta'aruf. Profil bukan halaman publik dan hanya dapat diakses sesuai hak akses yang ditentukan.

Ringkasan profil mengambil data terpilih dari spesifikasi biodata di atas. Data sensitif tidak ditampilkan otomatis dan mengikuti pengaturan hak akses serta tahap proses ta'aruf.

* Nama atau kode peserta.

* Username.

* Nomor telepon, tetapi hanya untuk admin dan tidak ditampilkan kepada kandidat tanpa izin.

* Agama dan manhaj.

* Pekerjaan dan tempat bekerja.

* Tempat dan tanggal lahir.

* Jenis kelamin.

* Status pernikahan.

* Tempat asal dan kota domisili.

* Urutan anak dalam keluarga.

* Provinsi dan suku.

* Tinggi badan, berat badan, dan warna kulit sesuai kebijakan visibilitas.

* Bentuk pernikahan yang diharapkan, apabila fitur tersebut digunakan oleh lembaga.

* Ringkasan bagian penting dari biodata lainnya.

Peserta dapat mengajukan perubahan data melalui tombol Edit. Perubahan pada data penting dapat dikembalikan ke status menunggu verifikasi agar integritas informasi tetap terjaga.

Sistem juga perlu menampilkan pernyataan bahwa peserta bertanggung jawab atas kebenaran data yang diberikan, disertai persetujuan terhadap ketentuan dan kebijakan privasi.

## 4\. Inbox dan Pusat Komunikasi

Inbox menjadi pusat komunikasi resmi antara peserta, mediator, dan admin. Fitur ini tidak dimaksudkan sebagai chat bebas, melainkan sebagai komunikasi yang terarah dan dapat diawasi.

* Dialog Ta'aruf.

* Tanya Jawab Terstruktur.

* Pesan dari Admin.

* Notifikasi Sistem.

* Riwayat pesan dan keputusan selama proses ta'aruf.

Setiap kategori dapat menampilkan badge jumlah pesan yang belum dibaca. Platform juga dapat menyediakan tombol untuk menghubungi Admin Akhwat atau Admin Ikhwan melalui WhatsApp apabila dukungan di luar sistem memang dibutuhkan.

Nomor pribadi antar peserta tidak boleh otomatis dibuka. Setiap pertukaran kontak harus mengikuti persetujuan dan mekanisme lembaga.

## 5\. Aktivitas Ta'aruf

Modul Aktivitas Ta'aruf mencatat perjalanan peserta secara kronologis sehingga proses mudah dipantau oleh peserta, mediator, dan admin.

* Permohonan ta'aruf yang dikirim.

* Permohonan ta'aruf yang diterima.

* Status diterima, ditolak, atau menunggu istikharah.

* Penetapan mediator.

* Pengumpulan dan pemeriksaan informasi referensi peserta.

* Sesi tanya jawab.

* Jadwal nazhor, waktu, tempat, wali, dan pihak pendamping.

* Keputusan melanjutkan atau mengundurkan diri.

* Status khitbah, persiapan akad nikah, walimah bila dicatat, menikah, atau proses selesai.

Riwayat tersebut menjadi audit trail internal. Data sensitifnya hanya boleh diakses oleh pihak yang berkepentingan.

## 6\. Status Akun dan Hak Akses

Setiap peserta memiliki status akun yang menentukan fitur apa saja yang dapat digunakan.

* Menunggu Verifikasi

* Biodata Belum Lengkap

* Referensi Belum Lengkap

* Aktif Mencari Pasangan

* Fokus pada Satu Calon

* Menunggu Persetujuan Ta'aruf

* Sedang Ta'aruf

* Menunggu Istikharah

* Menunggu atau Menjalani Nazhor

* Masa Penangguhan

* Khitbah

* Persiapan Akad Nikah

* Menikah

* Diarsipkan

* Dinonaktifkan oleh Peserta

* Ditangguhkan oleh Admin

Contohnya, peserta yang sedang fokus pada satu calon, sedang ta'aruf, atau telah memasuki nazhor tidak dapat menggunakan fitur pencarian pasangan. Peserta yang menonaktifkan akun tidak ditampilkan dalam rekomendasi, sedangkan peserta yang telah menikah dipindahkan ke arsip.

## 7\. Masa Penangguhan dan Penanganan Pelanggaran

Masa penangguhan digunakan untuk membatasi akses peserta secara sementara tanpa langsung menghapus akun.

* Pelanggaran terhadap aturan platform, misalnya memberikan kontak pribadi tanpa izin.

* Masa tunggu setelah peserta memilih mundur dari suatu proses ta'aruf.

* Pemeriksaan atau evaluasi oleh admin.

* Permintaan jeda sementara yang dilakukan melalui fitur nonaktivasi akun oleh peserta.

Durasi penangguhan dapat ditentukan oleh kebijakan lembaga, misalnya masa tunggu 24 jam setelah mengundurkan diri. Selama masa tersebut, fitur pencarian dapat dinonaktifkan, sedangkan akses lain mengikuti jenis penangguhan.

Halaman penangguhan harus menjelaskan alasan, durasi, fitur yang dibatasi, serta cara menghubungi admin apabila peserta membutuhkan penjelasan atau ingin mengajukan keberatan.

Penangguhan oleh admin berbeda dengan nonaktivasi sukarela oleh peserta. Akun yang ditangguhkan karena pelanggaran tidak dapat diaktifkan kembali secara mandiri sampai masa penangguhan selesai atau admin mencabut pembatasan.

## 8\. Dukungan Admin Ikhwan dan Admin Akhwat

Untuk menjaga kenyamanan dan adab, dukungan peserta dapat dipisahkan antara Admin Ikhwan dan Admin Akhwat.

* Verifikasi identitas dan biodata.

* Menjawab pertanyaan administrasi.

* Menerima laporan pelanggaran.

* Mengawasi komunikasi dan aktivitas ta'aruf.

* Mengatur masa penangguhan.

* Mengarahkan peserta kepada mediator yang sesuai.

Admin hanya memperoleh akses terhadap data yang diperlukan untuk menjalankan tugasnya. Pembagian data dan wilayah kerja perlu diatur melalui sistem hak akses.

## 9\. Membership dan Layanan Premium (Opsional)

Referensi sistem menunjukkan adanya membership seperti Gold Member. Konsep ini dapat dipertimbangkan sebagai model pendanaan, tetapi perlu dirancang agar tidak mengubah ta'aruf menjadi transaksi akses terhadap data pribadi.

* Pendampingan admin yang lebih intensif.

* Prioritas pemeriksaan kelengkapan biodata.

* Laporan kecocokan yang lebih terperinci.

* Akses materi edukasi pranikah.

* Fitur administrasi tambahan yang tidak mengurangi hak dasar peserta lain.

Perlu diputuskan fitur mana yang menjadi layanan dasar dan fitur mana yang dapat masuk ke paket premium. Keamanan, verifikasi, pelaporan pelanggaran, dan penjagaan privasi sebaiknya tetap tersedia bagi seluruh peserta.

## 10\. Modul Walimah dan Penyelesaian Proses

Modul penyelesaian pernikahan menjadi tahap penutup bagi peserta yang berhasil melanjutkan proses dari khitbah menuju akad nikah. Menu Walimah dapat tetap tersedia sebagai pencatatan tambahan.

* Konfirmasi status khitbah.

* Pencatatan rencana akad nikah dan, apabila diperlukan, rencana walimah.

* Konfirmasi bahwa proses ta'aruf telah selesai.

* Perubahan status akun menjadi menikah.

* Pengarsipan profil dari pencarian pasangan.

* Testimoni atau kisah keberhasilan secara opsional dan hanya dengan persetujuan kedua pihak.

Platform tidak harus mengambil alih penyelenggaraan walimah. Modul ini dapat difokuskan pada pencatatan status dan penyelesaian administrasi.

## 11\. Pengaturan Akun

Menu Settings digunakan untuk mengelola keamanan, privasi, dan preferensi akun.

* Mengubah password.

* Mengatur preferensi notifikasi.

* Mengajukan perubahan profil.

* Mengatur privasi data tertentu.

* Melihat ketentuan penggunaan dan kebijakan privasi.

* Menonaktifkan akun sementara secara mandiri tanpa melalui admin.

* Mengaktifkan kembali akun secara mandiri tanpa melalui admin.

* Melihat status nonaktif, tanggal perubahan, dan konsekuensi terhadap visibilitas profil.

Catatan implementasi: aturan nonaktivasi ketika peserta masih memiliki proses ta'aruf aktif perlu ditetapkan agar tidak merugikan calon yang sedang diproses.

* Mengajukan penghapusan akun dan data sesuai kebijakan lembaga.

* Keluar dari akun.

## 12\. Sistem Notifikasi

Notifikasi membantu peserta mengikuti proses tanpa harus memeriksa setiap halaman secara manual.

* Biodata belum lengkap atau membutuhkan perbaikan.

* Verifikasi disetujui atau ditolak.

* Kandidat baru yang memenuhi kriteria.

* Permohonan ta'aruf masuk.

* Perubahan status permohonan.

* Pesan baru dari admin atau mediator.

* Jadwal nazhor, waktu, tempat, keterlibatan wali, dan pengingat batas waktu.

* Awal atau berakhirnya masa penangguhan.

* Konfirmasi akun dinonaktifkan atau diaktifkan kembali oleh peserta.

* Perubahan status menjadi khitbah, persiapan akad nikah, walimah bila dicatat, atau menikah.

Notifikasi dapat tersedia di dalam aplikasi dan, setelah memperoleh persetujuan peserta, dapat diteruskan melalui email atau WhatsApp.

## **13\. Pusat Tutorial dan Panduan**

Pusat tutorial membantu peserta memahami tata cara platform dan alur ta'aruf tanpa selalu bergantung pada admin.

* Pada tahap awal, tutorial dibuat dalam bentuk halaman web bertahap yang ringan, mudah diperbarui, dan dapat dibaca langsung di dalam aplikasi.

* Pada tahap pengembangan berikutnya, setiap materi dapat dilengkapi video tutorial yang ditanamkan dari YouTube atau sumber video resmi lembaga.

* Panduan pendaftaran, verifikasi, dan pengisian biodata.

* Panduan menentukan kriteria, memilih calon, serta aturan satu proses aktif.

* Panduan pengajuan, persetujuan, istikharah, dan dialog ta'aruf.

* Panduan pengisian serta penggunaan informasi referensi minimal tiga orang.

* Panduan nazhor yang melibatkan wali, termasuk penentuan waktu dan tempat.

* Panduan khitbah, akad nikah, penyelesaian proses, dan pengarsipan akun.

* Panduan menonaktifkan dan mengaktifkan kembali akun secara mandiri.

Tutorial dapat tampil sebagai menu khusus, checklist onboarding, tooltip kontekstual, dan tautan bantuan pada setiap tahap proses.

## **14\. Peran dan Hak Akses Pengguna**

Pembagian peran diperlukan agar setiap pengguna hanya dapat melihat data dan menjalankan tindakan yang sesuai dengan tanggung jawabnya.

* Peserta Ikhwan: Mengelola biodata dan referensi, mencari kandidat sesuai izin, mengajukan ta'aruf, mengikuti satu proses aktif, serta mengelola status aktif atau nonaktif akun.

* Peserta Akhwat: Mengelola biodata dan referensi, menerima atau mengajukan proses sesuai kebijakan, mengikuti satu proses aktif, melibatkan wali pada tahap nazhor, serta mengelola status aktif atau nonaktif akun.

* **Admin Ikhwan:** Menangani verifikasi, bantuan, dan moderasi untuk peserta ikhwan.

* **Admin Akhwat:** Menangani verifikasi, bantuan, dan moderasi untuk peserta akhwat.

* **Mediator:** Mendampingi dialog, tanya jawab, dan proses pengambilan keputusan.

* **Super Admin:** Mengelola konfigurasi platform, pengguna internal, membership, laporan, dan audit sistem.

**Catatan Klarifikasi:**

* Keputusan proses: setiap peserta hanya boleh menjalani satu proses ta'aruf aktif pada satu waktu.

* Perlu ditentukan batas akses mediator terhadap biodata dan riwayat peserta.

* Perlu ditentukan apakah wali memiliki akun tersendiri atau hanya terlibat melalui admin.

* Perlu ditentukan fitur yang termasuk layanan gratis dan layanan premium.

* Perlu ditentukan durasi dan mekanisme penangguhan untuk setiap jenis pelanggaran.

# **Nilai yang Ingin Dibangun**

Platform ini mengedepankan beberapa prinsip utama:

* Menjaga pandangan dan kehormatan peserta.

* Mengutamakan niat menuju pernikahan.

* Menjaga privasi pengguna.

* Menghindari khalwat digital.

* Meminimalkan interaksi yang tidak diperlukan.

* Menghadirkan proses yang lebih aman, terarah, dan sesuai syariat.

---

# **Fitur yang Tidak Disediakan**

Untuk menjaga tujuan platform, beberapa fitur yang umum ditemukan pada aplikasi dating tidak akan tersedia, seperti:

* Swipe kanan/kiri

* Chat bebas

* Story

* Feed

* Like

* Follow

* Video call

* Voice call

* Live streaming

* Komentar publik

Seluruh fitur dirancang agar pengguna fokus pada proses ta'aruf, bukan membangun hubungan layaknya media sosial.

---

# **Model Bisnis dan Operasional**

Saat ini dokumen masih berfokus pada konsep syariat dan alur proses.

**Catatan Klarifikasi:**

* Perlu dibahas lebih lanjut terkait:

* Model monetisasi (gratis, berbayar, donasi, membership seperti Gold Member, atau hybrid)

* Biaya operasional (server, verifikasi, mediator, admin ikhwan/akhwat, dan dukungan pengguna)

  * Sumber pendanaan awal

* Batas fitur peserta reguler dan premium, dengan prinsip bahwa layanan berbayar tidak boleh membuka data pribadi secara sembarangan atau mengurangi keamanan proses ta'aruf.

Hal ini penting untuk memastikan keberlanjutan platform dalam jangka panjang.

---

# **Visi Platform**

Website ini diharapkan menjadi sarana yang membantu kaum muslimin dan muslimat menemukan pasangan hidup melalui proses yang lebih terjaga, profesional, dan sesuai tuntunan syariat.

Dengan pendekatan tersebut, platform ini bukan sekadar aplikasi pencarian pasangan, tetapi menjadi ekosistem ta'aruf yang mendampingi peserta sejak pendaftaran, pemilihan satu calon, pemeriksaan referensi, nazhor bersama wali, khitbah, hingga akad nikah.

---

# **Referensi**

[https://birojodoh.rumaysho.com/](https://birojodoh.rumaysho.com/) \- Rumaysho

[https://mawaddahindonesia.com/](https://mawaddahindonesia.com/) \- Ustadz Khalid

[https://home.hsi.id/divisi/sakinah/](https://home.hsi.id/divisi/sakinah/) \- HSI Abdullah Roy