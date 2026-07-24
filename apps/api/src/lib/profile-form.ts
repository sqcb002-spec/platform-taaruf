export type ProfileField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
  labelFor?: Partial<Record<"participant_male" | "participant_female", string>>;
  optionsFor?: Partial<Record<"participant_male" | "participant_female", string[]>>;
  placeholder?: string;
  sensitive?: boolean;
  required?: boolean;
  visibleFor?: Array<"participant_male" | "participant_female">;
};
export type ProfileSectionDefinition = {
  key: string;
  label: string;
  description: string;
  fields: ProfileField[];
  sensitive?: boolean;
};

export const profileFormSections: ProfileSectionDefinition[] = [
  {
    key: "profile",
    label: "Data diri",
    description: "Informasi dasar untuk memulai proses.",
    fields: [],
  },
  {
    key: "identity",
    label: "Foto & identitas",
    description:
      "KTP dan foto verifikasi diri diproses privat oleh sistem dan admin.",
    fields: [],
  },
  {
    key: "physical",
    label: "Gambaran fisik",
    description:
      "Gambaran fisik yang relevan untuk proses, tanpa foto terbuka.",
    fields: [
      { name: "heightCm", label: "Tinggi badan (cm)", type: "number" },
      { name: "weightKg", label: "Berat badan (kg)", type: "number" },
      { name: "bodyShape", label: "Bentuk fisik", type: "select", options: ["Kurus", "Normal", "Gemuk"] },
      { name: "skinTone", label: "Warna kulit", type: "select", options: ["Putih", "Kuning langsat", "Sawo matang", "Cokelat", "Gelap"] },
      { name: "hairType", label: "Tipe rambut", type: "select", options: ["Lurus", "Bergelombang", "Ikal", "Keriting", "Botak"] },
      { name: "hairColor", label: "Warna rambut", type: "select", options: ["Hitam", "Cokelat", "Kemerahan", "Lainnya"], required: false },
      { name: "favoriteSport", label: "Olahraga yang digemari", placeholder: "Contoh: Jalan kaki, renang, atau futsal", required: false },
      { name: "distinctiveFeatures", label: "Ciri khas", type: "textarea", placeholder: "Kosongkan jika tidak ada", required: false },
      { name: "physicalDisability", label: "Cacat fisik", type: "textarea", required: false },
      { name: "medicalHistory", label: "Riwayat penyakit yang relevan", type: "textarea", required: false, sensitive: true },
    ],
  },
  {
    key: "self",
    label: "Gambaran diri",
    description:
      "Cara Anda menggambarkan nilai, minat, kelebihan, dan kekurangan diri.",
    fields: [
      { name: "motto", label: "Apa prinsip atau pegangan hidup yang paling Anda jaga?", type: "textarea", placeholder: "Ceritakan prinsip yang memengaruhi keputusan dan keseharian Anda.", required: false },
      { name: "lifeTarget", label: "Apa target hidup yang sedang Anda perjuangkan?", type: "textarea", placeholder: "Jelaskan target dunia dan akhirat yang ingin Anda capai." },
      {
        name: "achievements",
        label: "Pencapaian apa yang paling berarti bagi Anda?",
        type: "textarea",
        placeholder: "Boleh berupa pendidikan, pekerjaan, keluarga, dakwah, atau perkembangan diri.",
        required: false,
      },
      { name: "hobbies", label: "Apa hobi dan kegiatan yang rutin Anda nikmati?", placeholder: "Contoh: membaca, memasak, mendaki, atau berkebun.", required: false },
      { name: "likes", label: "Hal seperti apa yang membuat Anda nyaman dan bersemangat?", type: "textarea", placeholder: "Ceritakan suasana, kegiatan, atau kebiasaan yang Anda sukai.", required: false },
      { name: "dislikes", label: "Apa yang tidak Anda sukai atau sulit Anda toleransi?", type: "textarea", placeholder: "Jelaskan secara wajar tanpa merendahkan orang lain.", required: false },
      {
        name: "characterSummary",
        label: "Bagaimana orang terdekat biasanya menggambarkan diri Anda?",
        type: "textarea",
        placeholder: "Contoh: tenang, terstruktur, mudah bergaul, atau membutuhkan waktu untuk terbuka.",
      },
      { name: "positiveTraits", label: "Apa tiga kelebihan utama Anda?", type: "textarea", placeholder: "Sertakan contoh singkat agar jawaban lebih nyata." },
      {
        name: "negativeTraits",
        label: "Apa kekurangan yang sedang Anda perbaiki?",
        type: "textarea",
        placeholder: "Jelaskan kekurangan dan langkah yang sedang Anda lakukan untuk memperbaikinya.",
      },
      {
        name: "polygamyPosition",
        label: "Bagaimana posisi Anda terkait bentuk pernikahan?",
        labelFor: {
          participant_male: "Apakah Anda memiliki rencana untuk berpoligami?",
          participant_female: "Bagaimana kesiapan Anda bila calon memiliki pandangan tentang poligami?",
        },
        type: "select",
        optionsFor: {
          participant_male: ["Tidak, menginginkan monogami", "Belum ada rencana, tetapi terbuka membahasnya", "Ya, memiliki rencana poligami"],
          participant_female: ["Hanya bersedia monogami", "Dapat dibahas bersama wali dengan syarat", "Bersedia dipoligami sesuai ketentuan syariat"],
        },
        sensitive: true,
      },
      { name: "freeTime", label: "Bagaimana biasanya Anda menggunakan waktu luang?", type: "textarea", placeholder: "Ceritakan kegiatan pada hari kerja dan akhir pekan.", required: false },
      { name: "substanceUse", label: "Merokok, alkohol, atau khamr", type: "select", options: ["Tidak", "Merokok", "Pernah dan sudah berhenti"], sensitive: true },
    ],
  },
  {
    key: "family",
    label: "Keluarga",
    description:
      "Kondisi keluarga inti dan hubungan yang berpengaruh pada pernikahan.",
    sensitive: true,
    fields: [
      { name: "fatherName", label: "Nama ayah", placeholder: "Nama lengkap ayah" },
      { name: "fatherOccupation", label: "Pekerjaan ayah", placeholder: "Contoh: PNS" },
      { name: "fatherReligion", label: "Agama ayah", placeholder: "Contoh: Islam", required: false },
      { name: "motherName", label: "Nama ibu", placeholder: "Nama lengkap ibu" },
      { name: "motherOccupation", label: "Pekerjaan ibu", placeholder: "Contoh: Ibu Rumah Tangga" },
      { name: "motherReligion", label: "Agama ibu", placeholder: "Contoh: Islam", required: false },
      { name: "childOrder", label: "Anak ke-", type: "number", placeholder: "Contoh: 1" },
      { name: "siblingCount", label: "Jumlah saudara", type: "number", placeholder: "Contoh: 3" },
      { name: "polygamyPosition", label: "Sikap terhadap poligami", type: "select", options: ["Menerima dengan syarat", "Tidak bersedia", "Perlu dibahas bersama keluarga"] },
      { name: "parentsUnderstanding", label: "Latar belakang pemahaman / ormas kedua orang tua", type: "textarea", placeholder: "Contoh: Nahdiyin, Muhammadiyah, atau jelaskan latar belakang keluarga" },
    ],
  },
  {
    key: "family_details",
    label: "Detail keluarga",
    description: "Informasi tambahan keluarga inti untuk membantu mediator memahami latar belakang Anda.",
    sensitive: true,
    fields: [
      { name: "fatherAge", label: "Usia ayah", type: "number", required: false },
      { name: "fatherEducation", label: "Pendidikan terakhir ayah", type: "select", options: ["Tidak sekolah", "SD", "SMP", "SMA/SMK", "Diploma", "Sarjana", "Pascasarjana"], required: false },
      { name: "motherAge", label: "Usia ibu", type: "number", required: false },
      { name: "motherEducation", label: "Pendidikan terakhir ibu", type: "select", options: ["Tidak sekolah", "SD", "SMP", "SMA/SMK", "Diploma", "Sarjana", "Pascasarjana"], required: false },
      { name: "siblingsDetail", label: "Ringkasan kakak dan adik", type: "textarea", placeholder: "Bila berkenan, tuliskan usia, pendidikan, pekerjaan, agama, dan status hidup secara ringkas.", required: false },
    ],
  },
  {
    key: "education",
    label: "Pendidikan",
    description: "Riwayat pendidikan formal dan nonformal.",
    fields: [
      { name: "elementary", label: "SD: lembaga, tahun, status", required: false },
      { name: "junior", label: "SLTP: lembaga, tahun, status", required: false },
      { name: "senior", label: "SMU: lembaga, jurusan, tahun, status", required: false },
      {
        name: "college",
        label: "Kuliah: lembaga, jurusan, tahun, status",
        type: "textarea",
        required: false,
      },
      { name: "nonFormal", label: "Pendidikan nonformal", type: "textarea", required: false },
    ],
  },
  {
    key: "experience",
    label: "Pengalaman",
    description:
      "Pengalaman kerja, organisasi, bisnis, dakwah, atau kegiatan sosial.",
    fields: [
      { name: "work", label: "Pengalaman kerja", type: "textarea", required: false },
      {
        name: "organization",
        label: "Pengalaman organisasi",
        type: "textarea",
        required: false,
      },
      {
        name: "dawah",
        label: "Pengalaman dakwah atau sosial",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    key: "religion",
    label: "Ibadah & pemahaman",
    description:
      "Jawaban dicatat untuk review manual dan tidak dinilai benar-salah secara otomatis.",
    fields: [
      {
        name: "whereIsAllah",
        label: "Menurut Anda, di manakah Allah berada?",
        type: "textarea",
        placeholder: "Jawab berdasarkan pemahaman dan rujukan yang Anda pelajari.",
      },
      { name: "quranMemorization", label: "Adakah tambahan tentang hafalan Al-Qur’an Anda?", required: false },
      { name: "quranReading", label: "Adakah tambahan tentang kemampuan membaca Al-Qur’an Anda?", required: false },
      {
        name: "demonstration",
        label: "Apa pendapat Anda tentang demonstrasi kepada pemerintah yang sah?",
        type: "select",
        options: ["Tidak dibolehkan", "Dibolehkan dengan syarat", "Belum memahami dan ingin mempelajarinya"],
        required: false,
      },
      { name: "music", label: "Bagaimana sikap Anda terhadap musik?", type: "select", options: ["Menghindari musik", "Masih mendengarkan sesekali dan sedang mengurangi", "Masih rutin mendengarkan"] },
      {
        name: "ikhtilath",
        label: "Bagaimana sikap Anda terhadap ikhtilath?",
        type: "select",
        options: ["Menghindari kecuali kebutuhan yang dibenarkan", "Masih terjadi karena pekerjaan atau pendidikan", "Belum memahami batasannya"],
      },
      { name: "tawhid", label: "Makna Laa ilaaha illallah", type: "textarea" },
      {
        name: "quranCreated",
        label: "Apakah Al-Qur’an makhluk?",
        type: "select",
        options: ["Bukan makhluk", "Makhluk", "Belum memahami"],
        required: false,
      },
      { name: "shia", label: "Bagaimana pandangan Anda tentang Syiah?", type: "select", options: ["Menyimpang dari Ahlus Sunnah", "Bagian dari perbedaan yang dapat diterima", "Belum memahami"], required: false },
      {
        name: "majorSin",
        label: "Apakah pelaku dosa besar kafir?",
        type: "select",
        options: ["Tidak kafir selama tidak menghalalkan dosanya", "Kafir", "Belum memahami"],
        required: false,
      },
      { name: "umrahStatus", label: "Riwayat umrah", type: "select", options: ["Belum pernah", "Sudah pernah", "Berencana bila dimudahkan"], required: false },
      { name: "hajjStatus", label: "Riwayat haji", type: "select", options: ["Belum pernah", "Sudah pernah", "Sudah mendaftar atau menunggu antrean", "Berencana bila dimudahkan"], required: false },
      { name: "hajjUmrah", label: "Catatan tambahan tentang haji atau umrah", required: false },
      { name: "scholarReferences", label: "Siapa ustadz yang rutin Anda jadikan rujukan belajar agama?", type: "textarea", placeholder: "Sebutkan nama ustadz atau lembaga kajian dan seberapa rutin Anda mengikutinya." },
      {
        name: "prayer",
        label: "Kebiasaan shalat lima waktu dan berjamaah",
        type: "select",
        options: ["Menjaga lima waktu dan berjamaah", "Menjaga lima waktu, berjamaah belum rutin", "Sedang memperbaiki konsistensi"],
        required: false,
      },
      {
        name: "congregationalPrayer",
        label: "Kebiasaan shalat berjamaah",
        labelFor: {
          participant_male: "Seberapa rutin Anda shalat fardhu berjamaah di masjid?",
          participant_female: "Seberapa rutin Anda menjaga shalat fardhu berjamaah bila memungkinkan?",
        },
        type: "select",
        options: ["Rutin", "Cukup rutin", "Sesekali", "Belum rutin"],
        required: false,
      },
      { name: "tahajjud", label: "Kebiasaan shalat tahajjud", type: "select", options: ["Rutin", "Sesekali", "Belum rutin"], required: false },
      { name: "witr", label: "Kebiasaan shalat witir", type: "select", options: ["Rutin", "Sesekali", "Belum rutin"], required: false },
      { name: "duha", label: "Kebiasaan shalat dhuha", type: "select", options: ["Rutin", "Sesekali", "Belum rutin"], required: false },
      { name: "sunnahPrayer", label: "Catatan tambahan tentang shalat sunnah", required: false },
      { name: "fasting", label: "Kebiasaan puasa sunnah", type: "select", options: ["Rutin", "Sesekali", "Belum rutin"], required: false },
      { name: "sadaqah", label: "Kebiasaan bersedekah", type: "select", options: ["Rutin sesuai kemampuan", "Sesekali", "Belum rutin"], required: false },
      { name: "zakat", label: "Pelaksanaan zakat ketika telah wajib", type: "select", options: ["Menunaikan", "Belum terkena kewajiban", "Belum memahami rinciannya"], required: false },
      { name: "waqf", label: "Kebiasaan atau pengalaman berwakaf", type: "select", options: ["Pernah atau rutin", "Belum pernah", "Belum memahami"], required: false },
      { name: "infaq", label: "Kebiasaan berinfak", type: "select", options: ["Rutin sesuai kemampuan", "Sesekali", "Belum rutin"], required: false },
      {
        name: "charity",
        label: "Catatan tambahan tentang zakat, sedekah, wakaf, atau infak",
        required: false,
      },
      { name: "veilPractice", label: "Kebiasaan bercadar dan berpakaian", type: "select", options: ["Bercadar", "Tidak bercadar dan menjaga hijab syar’i", "Sedang memperbaiki cara berpakaian"], visibleFor: ["participant_female"], required: false },
      { name: "isbalPractice", label: "Kebiasaan terkait isbal", type: "select", options: ["Menjaga pakaian di atas mata kaki", "Belum konsisten", "Belum memahami"], visibleFor: ["participant_male"], required: false },
      { name: "beardPractice", label: "Kebiasaan memelihara janggut", type: "select", options: ["Memelihara janggut", "Belum konsisten", "Tidak memelihara"], visibleFor: ["participant_male"], required: false },
    ],
  },
  {
    key: "marriage",
    label: "Persiapan pernikahan",
    description: "Kesiapan nyata dan tujuan membangun rumah tangga.",
    sensitive: true,
    fields: [
      { name: "marriageIntention", label: "Apa niat utama Anda menikah?", type: "textarea", placeholder: "Ceritakan alasan dan tujuan yang ingin Anda jaga dalam pernikahan." },
      { name: "vision", label: "Visi pernikahan", type: "textarea" },
      { name: "mission", label: "Misi pernikahan", type: "textarea", required: false },
      {
        name: "cost",
        label: "Bagaimana kesiapan biaya pernikahan Anda?",
        labelFor: {
          participant_male: "Bagaimana kesiapan Anda membiayai pernikahan?",
          participant_female: "Bagaimana harapan Anda terkait pembiayaan pernikahan?",
        },
        type: "select",
        optionsFor: {
          participant_male: ["Sudah siap secara mandiri", "Dibantu keluarga", "Masih menabung", "Perlu dibicarakan bersama"],
          participant_female: ["Disiapkan calon suami", "Dapat dibantu kedua keluarga", "Bersedia menyesuaikan kemampuan", "Perlu dibicarakan bersama"],
        },
      },
      {
        name: "mahr",
        label: "Harapan terkait mahar",
        labelFor: {
          participant_male: "Bagaimana kesiapan Anda terkait mahar?",
          participant_female: "Apa harapan Anda terkait mahar?",
        },
        type: "textarea",
        required: false,
      },
      { name: "mental", label: "Seberapa siap mental Anda untuk menikah?", type: "select", options: ["Siap", "Cukup siap dan masih belajar", "Masih membutuhkan persiapan"] },
      {
        name: "parenting",
        label: "Pola asuh yang diharapkan",
        type: "textarea",
        required: false,
      },
      { name: "familyRelationship", label: "Bagaimana hubungan Anda dengan orang tua dan keluarga besar?", type: "textarea", placeholder: "Ceritakan kedekatan, pola komunikasi, dan tanggung jawab yang sedang Anda jalankan." },
      { name: "timeline", label: "Kapan Anda siap menikah?", type: "select", options: ["Kurang dari 3 bulan", "3–6 bulan", "6–12 bulan", "Lebih dari 1 tahun"] },
      {
        name: "sexualIdentityDisclosure",
        label: "Adakah kondisi terkait identitas gender atau ketertarikan romantis/seksual yang material bagi kesiapan menikah dengan lawan jenis?",
        type: "select",
        options: ["Tidak ada kondisi yang perlu diungkapkan", "Ada dan saya bersedia membahasnya secara privat dengan mediator", "Saya belum yakin dan ingin konsultasi privat", "Saya memilih menjelaskannya langsung kepada mediator"],
        sensitive: true,
      },
      {
        name: "sexualIdentityDetail",
        label: "Penjelasan privat untuk mediator",
        type: "textarea",
        placeholder: "Opsional. Jangan menulis detail yang tidak ingin Anda simpan di platform.",
        sensitive: true,
        required: false,
      },
      {
        name: "seriousSafetyDisclosure",
        label: "Adakah riwayat kekerasan, pelecehan, kecanduan, atau pelanggaran hukum yang material bagi kehidupan pernikahan?",
        type: "select",
        options: ["Tidak ada", "Ada, sudah ditangani dan bersedia diverifikasi", "Ada dan masih dalam penanganan", "Saya memilih menjelaskannya langsung kepada mediator"],
        sensitive: true,
      },
      {
        name: "seriousSafetyDetail",
        label: "Penjelasan privat terkait keselamatan",
        type: "textarea",
        placeholder: "Opsional. Jelaskan hanya informasi yang material dan aman untuk disimpan.",
        sensitive: true,
        required: false,
      },
      {
        name: "childhoodWound",
        label: "Luka masa kecil/batin yang material",
        type: "textarea",
        sensitive: true,
        required: false,
      },
    ],
  },
  {
    key: "future",
    label: "Harapan ke depan",
    description: "Rencana kehidupan setelah menikah.",
    fields: [
      { name: "career", label: "Rencana karier", type: "textarea", required: false },
      { name: "futureDomicile", label: "Di mana Anda berencana tinggal setelah menikah?", type: "textarea", placeholder: "Sebutkan kota atau bentuk tempat tinggal serta kemungkinan berpindah." },
      { name: "children", label: "Bagaimana harapan Anda terkait keturunan?", type: "select", options: ["Ingin memiliki anak segera", "Ingin memiliki anak setelah persiapan", "Belum menentukan", "Tidak dapat atau tidak berencana memiliki anak—akan dijelaskan saat ta’aruf"] },
      { name: "childEducation", label: "Pendidikan anak", type: "textarea", required: false },
      { name: "finance", label: "Bagaimana keuangan keluarga sebaiknya dikelola?", type: "select", options: ["Dikelola bersama secara terbuka", "Dikelola suami dengan keterbukaan", "Dikelola istri dengan kesepakatan", "Akan dimusyawarahkan"] },
      {
        name: "parentFinancialSupport",
        label: "Apakah setelah menikah Anda masih memiliki tanggungan keluarga?",
        labelFor: {
          participant_male: "Apakah setelah menikah Anda tetap menanggung nafkah orang tua atau keluarga?",
          participant_female: "Apakah setelah menikah Anda masih memiliki tanggungan keuangan untuk orang tua atau keluarga?",
        },
        type: "select",
        options: ["Tidak ada tanggungan rutin", "Ada tanggungan rutin", "Ada tanggungan sewaktu-waktu", "Akan dijelaskan saat ta’aruf"],
        sensitive: true,
      },
      {
        name: "religiousGrowth",
        label: "Peningkatan ilmu agama",
        type: "textarea",
        required: false,
      },
      { name: "shortTarget", label: "Apa target jangka pendek Anda setelah menikah?", type: "textarea", placeholder: "Contoh: tempat tinggal, penyesuaian kerja, keuangan, atau pendidikan keluarga.", required: false },
      { name: "longTarget", label: "Apa target jangka panjang Anda setelah menikah?", type: "textarea", placeholder: "Ceritakan gambaran keluarga yang ingin dibangun dalam lima sampai sepuluh tahun.", required: false },
      {
        name: "wifeWorking",
        label: "Bagaimana pandangan Anda tentang pekerjaan istri?",
        labelFor: {
          participant_male: "Apakah Anda membolehkan istri bekerja setelah menikah?",
          participant_female: "Apakah Anda ingin tetap bekerja setelah menikah?",
        },
        type: "select",
        optionsFor: {
          participant_male: ["Boleh", "Tidak", "Boleh dengan syarat dan kesepakatan", "Akan dibicarakan saat ta’aruf"],
          participant_female: ["Ya", "Tidak", "Kondisional sesuai kebutuhan keluarga", "Akan dibicarakan saat ta’aruf"],
        },
      },
    ],
  },
  {
    key: "criteria_physical",
    label: "Kriteria fisik",
    description: "Tuliskan preferensi secara wajar. Pilih tidak ada preferensi bila hal tersebut bukan syarat.",
    fields: [
      { name: "bodyShape", label: "Bentuk tubuh seperti apa yang Anda harapkan?", type: "select", options: ["Tidak ada preferensi", "Kurus", "Normal", "Gemuk"], required: false },
      { name: "heightRange", label: "Berapa rentang tinggi badan yang Anda harapkan?", placeholder: "Contoh: 155–165 cm atau tidak ada preferensi", required: false },
      { name: "skinTone", label: "Apakah Anda memiliki preferensi warna kulit?", type: "select", options: ["Tidak ada preferensi", "Putih", "Kuning langsat", "Sawo matang", "Cokelat", "Gelap"], required: false },
      { name: "hairType", label: "Apakah Anda memiliki preferensi tipe rambut?", type: "select", options: ["Tidak ada preferensi", "Lurus", "Bergelombang", "Ikal", "Keriting", "Botak"], required: false },
      {
        name: "healthExpectation",
        label: "Adakah kondisi fisik atau kesehatan pasangan yang perlu Anda pertimbangkan?",
        type: "textarea",
        placeholder: "Tuliskan batas yang benar-benar material, atau jawab tidak ada.",
        required: false,
      },
      {
        name: "physicalCriteria",
        label: "Adakah preferensi fisik lain yang belum disebutkan?",
        type: "textarea",
        placeholder: "Opsional. Hindari kata-kata yang merendahkan bentuk fisik tertentu.",
        required: false,
      },
    ],
  },
  {
    key: "criteria_nonphysical",
    label: "Kriteria non-fisik",
    description: "Bedakan kebutuhan yang benar-benar wajib dengan preferensi yang masih dapat dibicarakan.",
    fields: [
      { name: "age", label: "Berapa rentang usia pasangan yang Anda harapkan?", placeholder: "Contoh: 25–32 tahun" },
      {
        name: "maritalStatus",
        label: "Status pernikahan apa yang dapat Anda terima?",
        labelFor: {
          participant_male: "Apakah Anda bersedia menikah dengan janda?",
          participant_female: "Apakah Anda bersedia menikah dengan duda?",
        },
        type: "select",
        optionsFor: {
          participant_male: ["Hanya akhwat yang belum pernah menikah", "Bersedia dengan janda cerai hidup", "Bersedia dengan janda cerai mati", "Semua dapat dipertimbangkan"],
          participant_female: ["Hanya ikhwan yang belum pernah menikah", "Bersedia dengan duda cerai hidup", "Bersedia dengan duda cerai mati", "Semua dapat dipertimbangkan"],
        },
      },
      { name: "education", label: "Pendidikan minimal seperti apa yang Anda harapkan?", placeholder: "Contoh: SMA/sederajat, atau tidak ada syarat khusus", required: false },
      { name: "ethnicity", label: "Apakah suku pasangan menjadi pertimbangan?", placeholder: "Contoh: tidak ada preferensi, atau jelaskan pertimbangan keluarga", required: false },
      {
        name: "occupation",
        label: "Pekerjaan atau pola kerja seperti apa yang dapat Anda terima?",
        labelFor: {
          participant_male: "Apakah Anda memiliki preferensi terkait pekerjaan calon istri?",
          participant_female: "Pekerjaan dan kesiapan nafkah seperti apa yang Anda harapkan dari calon suami?",
        },
        placeholder: "Jelaskan bila ada batas yang penting untuk kehidupan rumah tangga.",
        required: false,
      },
      { name: "domicile", label: "Domisili pasangan yang dapat Anda pertimbangkan?", placeholder: "Contoh: Jabodetabek, seluruh Indonesia, atau bersedia LDR sementara" },
      {
        name: "religionCriteria",
        label: "Pemahaman agama dan manhaj seperti apa yang Anda harapkan?",
        type: "textarea",
        placeholder: "Jelaskan batas pemahaman yang wajib dan hal yang masih dapat dipelajari bersama.",
      },
      { name: "worshipCriteria", label: "Kebiasaan ibadah apa yang paling penting bagi Anda?", type: "textarea", placeholder: "Contoh: menjaga shalat wajib, rutin belajar agama, dan membaca Al-Qur’an.", required: false },
      { name: "characterCriteria", label: "Karakter utama apa yang Anda cari pada pasangan?", type: "textarea", placeholder: "Pilih beberapa karakter terpenting dan jelaskan alasannya." },
      { name: "communicationCriteria", label: "Gaya komunikasi dan penyelesaian konflik seperti apa yang Anda harapkan?", type: "textarea", placeholder: "Contoh: terbuka, tidak mendiamkan berkepanjangan, dan bersedia bermusyawarah.", required: false },
      { name: "familyCriteria", label: "Adakah kondisi keluarga pasangan yang perlu dipertimbangkan?", type: "textarea", placeholder: "Contoh: keterlibatan orang tua, tanggungan keluarga, atau tidak ada syarat khusus.", required: false },
      { name: "smokingCriteria", label: "Bagaimana batas Anda terkait rokok dan kebiasaan adiktif?", type: "select", options: ["Harus tidak merokok", "Sedang berhenti dapat dipertimbangkan", "Dapat dibicarakan"] },
      { name: "readinessCriteria", label: "Kesiapan menikah seperti apa yang Anda harapkan dari pasangan?", type: "textarea", placeholder: "Jelaskan kesiapan waktu, mental, keluarga, dan tanggung jawab.", required: false },
      { name: "nonNegotiables", label: "Apa syarat yang benar-benar tidak dapat Anda kompromikan?", type: "textarea", placeholder: "Batasi pada hal yang material bagi kehidupan rumah tangga." },
      { name: "flexiblePreferences", label: "Preferensi apa yang masih dapat Anda musyawarahkan?", type: "textarea", placeholder: "Contoh: lokasi tinggal, pekerjaan, usia, atau latar pendidikan.", required: false },
    ],
  },
  {
    key: "partner_questions",
    label: "Pertanyaan pasangan",
    description:
      "Respons Anda ketika harapan dan konflik tidak berjalan ideal.",
    fields: [
      {
        name: "unmetExpectation",
        label: "Bagaimana sikap Anda bila pasangan tidak memenuhi seluruh harapan?",
        type: "textarea",
        placeholder: "Jelaskan cara membedakan kekurangan yang dapat diterima dan masalah yang perlu diselesaikan.",
        required: false,
      },
      {
        name: "blaming",
        label: "Bagaimana Anda menyikapi pasangan yang berbuat kesalahan?",
        type: "textarea",
        placeholder: "Ceritakan cara menegur, mendengar penjelasan, dan mencari perbaikan.",
      },
      {
        name: "conflict",
        label: "Apa yang Anda lakukan ketika konflik belum menemukan jalan keluar?",
        type: "textarea",
        placeholder: "Jelaskan kapan berdiskusi, memberi jeda, atau meminta bantuan pihak tepercaya.",
      },
      { name: "husbandDuties", label: "Menurut Anda, apa kewajiban utama seorang suami?", type: "textarea", placeholder: "Jawab berdasarkan pemahaman dan praktik rumah tangga yang Anda harapkan.", required: false },
      { name: "wifeDuties", label: "Menurut Anda, apa kewajiban utama seorang istri?", type: "textarea", placeholder: "Jawab berdasarkan pemahaman dan praktik rumah tangga yang Anda harapkan.", required: false },
      { name: "husbandRights", label: "Menurut Anda, apa hak utama seorang suami?", type: "textarea", placeholder: "Jelaskan dengan bahasa Anda sendiri.", required: false },
      { name: "wifeRights", label: "Menurut Anda, apa hak utama seorang istri?", type: "textarea", placeholder: "Jelaskan dengan bahasa Anda sendiri.", required: false },
      { name: "differentOpinion", label: "Bagaimana Anda mengambil keputusan ketika pendapat suami dan istri berbeda?", type: "textarea", placeholder: "Jelaskan proses musyawarah dan batas yang Anda pahami." },
      { name: "apology", label: "Bagaimana cara Anda meminta maaf dan memulihkan hubungan?", type: "textarea", placeholder: "Ceritakan tindakan nyata yang biasa atau ingin Anda lakukan.", required: false },
      { name: "familyInterference", label: "Bagaimana Anda menetapkan batas keterlibatan keluarga besar?", type: "textarea", placeholder: "Jelaskan hal yang boleh dibantu keluarga dan yang perlu diputuskan pasangan.", required: false },
      { name: "financialDecision", label: "Adakah penjelasan tambahan tentang keputusan keuangan rumah tangga?", type: "textarea", placeholder: "Bahas hal penting yang belum terwakili pada pilihan pengelolaan keuangan.", required: false },
    ],
  },
  {
    key: "emotion",
    label: "Emosi & batas pribadi",
    description: "Cara mengelola emosi, menetapkan batas, dan membawa diri.",
    sensitive: true,
    fields: [
      { name: "mbti", label: "Hasil MBTI (informasi pendukung)", required: false },
      { name: "anger", label: "Apa yang biasanya Anda lakukan ketika marah?", type: "select", options: ["Menenangkan diri sebelum berbicara", "Memilih diam sementara", "Langsung membicarakan masalah", "Masih kesulitan mengelola kemarahan"], required: false },
      {
        name: "triggers",
        label: "Pemicu emosi",
        type: "textarea",
        sensitive: true,
        required: false,
      },
      { name: "boundaries", label: "Batasan pribadi", type: "textarea", required: false },
      { name: "demeanor", label: "Pembawaan diri", type: "textarea", required: false },
    ],
  },
  {
    key: "lifestyle",
    label: "Pola hidup",
    description: "Rutinitas makan, tidur, olahraga, dan kebiasaan penting.",
    fields: [
      { name: "dailyRoutine", label: "Ceritakan kegiatan Anda sehari-hari", type: "textarea", placeholder: "Ceritakan rutinitas sejak bangun, pekerjaan, ibadah, waktu keluarga, hingga istirahat.", required: false },
      { name: "diet", label: "Pola makan", type: "select", options: ["Teratur", "Tidak selalu teratur", "Memiliki pola makan khusus"], required: false },
      { name: "sleep", label: "Pola tidur", type: "select", options: ["Teratur dan cukup", "Sering tidur larut", "Menyesuaikan pekerjaan", "Memiliki kendala tidur"], required: false },
      { name: "exercise", label: "Pola olahraga", type: "select", options: ["Rutin", "Sesekali", "Belum rutin"], required: false },
      { name: "socialMedia", label: "Bagaimana kebiasaan Anda menggunakan media sosial?", type: "select", options: ["Tidak aktif", "Aktif sebagai pembaca", "Sesekali mengunggah", "Aktif membuat konten"], required: false },
      {
        name: "smoking",
        label: "Rokok atau kebiasaan adiktif",
        type: "select",
        options: ["Tidak ada", "Merokok", "Vape", "Lainnya—akan dijelaskan"],
        required: false,
      },
    ],
  },
  {
    key: "life_story",
    label: "Pengalaman hidup",
    description: "Pembelajaran masa lalu dan rencana masa depan yang material.",
    sensitive: true,
    fields: [
      {
        name: "pastLesson",
        label: "Kesalahan masa lalu yang menjadi pembelajaran",
        type: "textarea",
        sensitive: true,
        required: false,
      },
      {
        name: "majorEvent",
        label: "Hal besar yang pernah dilalui",
        type: "textarea",
        sensitive: true,
        required: false,
      },
      {
        name: "problemSolving",
        label: "Masalah besar yang pernah diselesaikan",
        type: "textarea",
        required: false,
      },
      {
        name: "unfinishedSelf",
        label: "Hal yang belum selesai dengan diri sendiri",
        type: "textarea",
        sensitive: true,
        required: false,
      },
      {
        name: "futureDream",
        label: "Hal yang ingin diwujudkan",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    key: "references",
    label: "Tiga referensi",
    description:
      "Minimal tiga orang yang mengenal keseharian Anda; hanya admin dan mediator berkepentingan yang dapat mengaksesnya.",
    sensitive: true,
    fields: [
      {
        name: "reference1",
        label: "Referensi 1: nama, hubungan, nomor HP, lama mengenal",
        type: "textarea",
      },
      {
        name: "reference2",
        label: "Referensi 2: nama, hubungan, nomor HP, lama mengenal",
        type: "textarea",
      },
      {
        name: "reference3",
        label: "Referensi 3: nama, hubungan, nomor HP, lama mengenal",
        type: "textarea",
      },
    ],
  },
];

export const sensitiveSectionKeys = new Set(
  profileFormSections
    .filter((section) => section.sensitive)
    .map((section) => section.key),
);

export const requiredProfileSectionKeys = [
  "profile",
  "physical",
  "family",
  "self",
  "religion",
  "marriage",
  "future",
  "partner_questions",
  "criteria_nonphysical",
  "references",
] as const;
