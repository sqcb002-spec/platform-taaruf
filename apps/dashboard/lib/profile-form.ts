export type ProfileField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
  placeholder?: string;
  sensitive?: boolean;
  required?: boolean;
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
      { name: "skinTone", label: "Warna kulit", type: "select", options: ["Putih", "Kuning langsat", "Sawo matang", "Cokelat", "Gelap"] },
      { name: "hairType", label: "Tipe rambut", type: "select", options: ["Lurus", "Bergelombang", "Ikal", "Keriting", "Botak"] },
      { name: "physicalDisability", label: "Cacat fisik", type: "textarea", required: false },
      { name: "medicalHistory", label: "Riwayat penyakit", type: "textarea", required: false },
    ],
  },
  {
    key: "self",
    label: "Gambaran diri",
    description:
      "Cara Anda menggambarkan nilai, minat, kelebihan, dan kekurangan diri.",
    fields: [
      { name: "motto", label: "Moto hidup", type: "textarea" },
      { name: "lifeTarget", label: "Target hidup", type: "textarea" },
      {
        name: "achievements",
        label: "Penghargaan atau pencapaian",
        type: "textarea",
      },
      { name: "hobbies", label: "Hobi" },
      { name: "likes", label: "Hal yang disukai", type: "textarea" },
      {
        name: "characterSummary",
        label: "Ringkasan karakter",
        type: "textarea",
      },
      { name: "positiveTraits", label: "Sifat positif", type: "textarea" },
      {
        name: "negativeTraits",
        label: "Sifat yang masih diperbaiki",
        type: "textarea",
      },
      {
        name: "polygamyPosition",
        label: "Pandangan dan kesiapan terkait poligami",
        type: "textarea",
        sensitive: true,
      },
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
    key: "education",
    label: "Pendidikan",
    description: "Riwayat pendidikan formal dan nonformal.",
    fields: [
      { name: "elementary", label: "SD: lembaga, tahun, status" },
      { name: "junior", label: "SLTP: lembaga, tahun, status" },
      { name: "senior", label: "SMU: lembaga, jurusan, tahun, status" },
      {
        name: "college",
        label: "Kuliah: lembaga, jurusan, tahun, status",
        type: "textarea",
      },
      { name: "nonFormal", label: "Pendidikan nonformal", type: "textarea" },
    ],
  },
  {
    key: "experience",
    label: "Pengalaman",
    description:
      "Pengalaman kerja, organisasi, bisnis, dakwah, atau kegiatan sosial.",
    fields: [
      { name: "work", label: "Pengalaman kerja", type: "textarea" },
      {
        name: "organization",
        label: "Pengalaman organisasi",
        type: "textarea",
      },
      {
        name: "dawah",
        label: "Pengalaman dakwah atau sosial",
        type: "textarea",
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
        label: "Allah berada di mana?",
        type: "textarea",
      },
      { name: "quranMemorization", label: "Hafalan Al-Qur’an" },
      { name: "quranReading", label: "Kemampuan membaca Al-Qur’an" },
      {
        name: "demonstration",
        label: "Pandangan tentang demonstrasi",
        type: "textarea",
      },
      { name: "music", label: "Pandangan tentang musik", type: "textarea" },
      {
        name: "ikhtilath",
        label: "Pemahaman tentang ikhtilath",
        type: "textarea",
      },
      { name: "tawhid", label: "Makna Laa ilaaha illallah", type: "textarea" },
      {
        name: "quranCreated",
        label: "Apakah Al-Qur’an makhluk? Jelaskan.",
        type: "textarea",
      },
      { name: "shia", label: "Pandangan tentang Syiah", type: "textarea" },
      {
        name: "majorSin",
        label: "Apakah pelaku dosa besar kafir? Jelaskan.",
        type: "textarea",
      },
      { name: "hajjUmrah", label: "Riwayat haji atau umrah" },
      {
        name: "prayer",
        label: "Kebiasaan shalat lima waktu dan berjamaah",
        type: "textarea",
      },
      { name: "sunnahPrayer", label: "Tahajjud, witir, dan dhuha" },
      { name: "fasting", label: "Puasa wajib dan sunnah" },
      {
        name: "charity",
        label: "Zakat, sedekah, wakaf, dan infak",
        type: "textarea",
      },
    ],
  },
  {
    key: "marriage",
    label: "Persiapan pernikahan",
    description: "Kesiapan nyata dan tujuan membangun rumah tangga.",
    sensitive: true,
    fields: [
      { name: "vision", label: "Visi pernikahan", type: "textarea" },
      { name: "mission", label: "Misi pernikahan", type: "textarea" },
      { name: "cost", label: "Kesiapan biaya pernikahan", type: "textarea" },
      { name: "mahr", label: "Harapan mahar", type: "textarea" },
      { name: "mental", label: "Persiapan mental", type: "textarea" },
      {
        name: "parenting",
        label: "Pola asuh yang diharapkan",
        type: "textarea",
      },
      { name: "timeline", label: "Target waktu menikah" },
      {
        name: "childhoodWound",
        label: "Luka masa kecil/batin yang material",
        type: "textarea",
        sensitive: true,
      },
    ],
  },
  {
    key: "future",
    label: "Harapan ke depan",
    description: "Rencana kehidupan setelah menikah.",
    fields: [
      { name: "career", label: "Rencana karier", type: "textarea" },
      { name: "futureDomicile", label: "Rencana domisili", type: "textarea" },
      { name: "children", label: "Harapan keturunan", type: "textarea" },
      { name: "childEducation", label: "Pendidikan anak", type: "textarea" },
      { name: "finance", label: "Keuangan rumah tangga", type: "textarea" },
      {
        name: "religiousGrowth",
        label: "Peningkatan ilmu agama",
        type: "textarea",
      },
      { name: "shortTarget", label: "Target jangka pendek", type: "textarea" },
      { name: "longTarget", label: "Target jangka panjang", type: "textarea" },
      {
        name: "wifeWorking",
        label: "Pandangan istri bekerja",
        type: "textarea",
      },
    ],
  },
  {
    key: "criteria_physical",
    label: "Kriteria fisik",
    description: "Kriteria fisik ditulis wajar tanpa merendahkan pihak lain.",
    fields: [
      {
        name: "physicalCriteria",
        label: "Kriteria fisik pasangan",
        type: "textarea",
      },
    ],
  },
  {
    key: "criteria_nonphysical",
    label: "Kriteria non-fisik",
    description: "Syarat wajib dan preferensi lunak pasangan.",
    fields: [
      { name: "age", label: "Rentang usia" },
      { name: "education", label: "Pendidikan" },
      { name: "ethnicity", label: "Suku" },
      { name: "occupation", label: "Pekerjaan" },
      { name: "domicile", label: "Domisili" },
      {
        name: "religionCriteria",
        label: "Agama, manhaj, dan kebiasaan ibadah",
        type: "textarea",
      },
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
        label: "Respons bila tidak mendapat pasangan sesuai seluruh keinginan",
        type: "textarea",
      },
      {
        name: "blaming",
        label:
          "Dalam kondisi apa Anda cenderung menyalahkan pasangan, dan bagaimana memperbaikinya?",
        type: "textarea",
      },
      {
        name: "conflict",
        label: "Cara bertahan dan mencari penyelesaian dalam konflik",
        type: "textarea",
      },
    ],
  },
  {
    key: "emotion",
    label: "Karakter & emosi",
    description: "Pengelolaan emosi, batasan, dan pembawaan diri.",
    sensitive: true,
    fields: [
      {
        name: "deepCharacter",
        label: "Penjelasan karakter mendalam",
        type: "textarea",
      },
      { name: "mbti", label: "Hasil MBTI (informasi pendukung)" },
      { name: "anger", label: "Kondisi ketika marah", type: "textarea" },
      {
        name: "triggers",
        label: "Pemicu emosi",
        type: "textarea",
        sensitive: true,
      },
      { name: "boundaries", label: "Batasan pribadi", type: "textarea" },
      { name: "demeanor", label: "Pembawaan diri", type: "textarea" },
    ],
  },
  {
    key: "lifestyle",
    label: "Pola hidup",
    description: "Rutinitas makan, tidur, olahraga, dan kebiasaan penting.",
    fields: [
      { name: "diet", label: "Pola makan", type: "textarea" },
      { name: "sleep", label: "Pola tidur", type: "textarea" },
      { name: "exercise", label: "Pola olahraga", type: "textarea" },
      {
        name: "smoking",
        label: "Rokok atau kebiasaan adiktif",
        type: "textarea",
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
      },
      {
        name: "majorEvent",
        label: "Hal besar yang pernah dilalui",
        type: "textarea",
        sensitive: true,
      },
      {
        name: "problemSolving",
        label: "Masalah besar yang pernah diselesaikan",
        type: "textarea",
      },
      {
        name: "unfinishedSelf",
        label: "Hal yang belum selesai dengan diri sendiri",
        type: "textarea",
        sensitive: true,
      },
      {
        name: "futureDream",
        label: "Hal yang ingin diwujudkan",
        type: "textarea",
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
