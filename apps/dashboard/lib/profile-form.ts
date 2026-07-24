export type ProfileField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
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
      { name: "motto", label: "Apa prinsip atau pegangan hidup yang paling Anda jaga?", type: "textarea", placeholder: "Ceritakan prinsip yang memengaruhi keputusan dan keseharian Anda." },
      { name: "lifeTarget", label: "Apa target hidup yang sedang Anda perjuangkan?", type: "textarea", placeholder: "Jelaskan target dunia dan akhirat yang ingin Anda capai." },
      {
        name: "achievements",
        label: "Pencapaian apa yang paling berarti bagi Anda?",
        type: "textarea",
        placeholder: "Boleh berupa pendidikan, pekerjaan, keluarga, dakwah, atau perkembangan diri.",
        required: false,
      },
      { name: "hobbies", label: "Apa hobi dan kegiatan yang rutin Anda nikmati?", placeholder: "Contoh: membaca, memasak, mendaki, atau berkebun." },
      { name: "likes", label: "Hal seperti apa yang membuat Anda nyaman dan bersemangat?", type: "textarea", placeholder: "Ceritakan suasana, kegiatan, atau kebiasaan yang Anda sukai." },
      { name: "dislikes", label: "Apa yang tidak Anda sukai atau sulit Anda toleransi?", type: "textarea", placeholder: "Jelaskan secara wajar tanpa merendahkan orang lain." },
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
        label: "Bagaimana pandangan dan kesiapan Anda terkait poligami?",
        type: "textarea",
        placeholder: "Jelaskan posisi Anda dengan jujur, termasuk batas atau pertimbangan keluarga.",
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
        label: "Menurut Anda, di manakah Allah berada?",
        type: "textarea",
        placeholder: "Jawab berdasarkan pemahaman dan rujukan yang Anda pelajari.",
      },
      { name: "quranMemorization", label: "Hafalan Al-Qur’an" },
      { name: "quranReading", label: "Kemampuan membaca Al-Qur’an" },
      {
        name: "demonstration",
        label: "Apa pendapat Anda tentang demonstrasi kepada pemerintah yang sah?",
        type: "textarea",
        placeholder: "Jelaskan pendapat serta dasar pemahaman yang Anda pegang.",
      },
      { name: "music", label: "Apa pendapat Anda tentang musik?", type: "textarea", placeholder: "Jelaskan pandangan dan penerapannya dalam keseharian Anda." },
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
      { name: "scholarReferences", label: "Siapa ustadz yang rutin Anda jadikan rujukan belajar agama?", type: "textarea", placeholder: "Sebutkan nama ustadz atau lembaga kajian dan seberapa rutin Anda mengikutinya." },
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
      { name: "veilPractice", label: "Kebiasaan bercadar dan berpakaian", type: "textarea", visibleFor: ["participant_female"], required: false },
      { name: "isbalPractice", label: "Kebiasaan terkait isbal", type: "textarea", visibleFor: ["participant_male"], required: false },
      { name: "beardPractice", label: "Kebiasaan memelihara janggut", type: "textarea", visibleFor: ["participant_male"], required: false },
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
      { name: "mission", label: "Misi pernikahan", type: "textarea" },
      { name: "cost", label: "Kesiapan biaya pernikahan", type: "textarea" },
      { name: "mahr", label: "Harapan mahar", type: "textarea" },
      { name: "mental", label: "Persiapan mental", type: "textarea" },
      {
        name: "parenting",
        label: "Pola asuh yang diharapkan",
        type: "textarea",
      },
      { name: "familyRelationship", label: "Bagaimana hubungan Anda dengan orang tua dan keluarga besar?", type: "textarea", placeholder: "Ceritakan kedekatan, pola komunikasi, dan tanggung jawab yang sedang Anda jalankan." },
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
      { name: "futureDomicile", label: "Di mana Anda berencana tinggal setelah menikah?", type: "textarea", placeholder: "Sebutkan kota atau bentuk tempat tinggal serta kemungkinan berpindah." },
      { name: "children", label: "Harapan keturunan", type: "textarea" },
      { name: "childEducation", label: "Pendidikan anak", type: "textarea" },
      { name: "finance", label: "Bagaimana Anda ingin mengatur keuangan keluarga?", type: "textarea", placeholder: "Jelaskan nafkah, anggaran, tabungan, keterbukaan penghasilan, dan pengambilan keputusan." },
      { name: "parentFinancialSupport", label: "Setelah menikah, apakah Anda masih memiliki tanggungan nafkah untuk orang tua atau keluarga?", type: "textarea", placeholder: "Jelaskan bentuk, perkiraan rutin, dan bagaimana hal ini akan dibicarakan dengan pasangan.", sensitive: true },
      {
        name: "religiousGrowth",
        label: "Peningkatan ilmu agama",
        type: "textarea",
      },
      { name: "shortTarget", label: "Apa target jangka pendek Anda setelah menikah?", type: "textarea", placeholder: "Contoh: tempat tinggal, penyesuaian kerja, keuangan, atau pendidikan keluarga." },
      { name: "longTarget", label: "Apa target jangka panjang Anda setelah menikah?", type: "textarea", placeholder: "Ceritakan gambaran keluarga yang ingin dibangun dalam lima sampai sepuluh tahun." },
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
    description: "Tuliskan preferensi secara wajar. Pilih tidak ada preferensi bila hal tersebut bukan syarat.",
    fields: [
      { name: "bodyShape", label: "Bentuk tubuh seperti apa yang Anda harapkan?", type: "select", options: ["Tidak ada preferensi", "Kurus", "Normal", "Gemuk"] },
      { name: "heightRange", label: "Berapa rentang tinggi badan yang Anda harapkan?", placeholder: "Contoh: 155–165 cm atau tidak ada preferensi" },
      { name: "skinTone", label: "Apakah Anda memiliki preferensi warna kulit?", type: "select", options: ["Tidak ada preferensi", "Putih", "Kuning langsat", "Sawo matang", "Cokelat", "Gelap"] },
      { name: "hairType", label: "Apakah Anda memiliki preferensi tipe rambut?", type: "select", options: ["Tidak ada preferensi", "Lurus", "Bergelombang", "Ikal", "Keriting", "Botak"], required: false },
      {
        name: "healthExpectation",
        label: "Adakah kondisi fisik atau kesehatan pasangan yang perlu Anda pertimbangkan?",
        type: "textarea",
        placeholder: "Tuliskan batas yang benar-benar material, atau jawab tidak ada.",
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
      { name: "maritalStatus", label: "Status pernikahan apa yang dapat Anda terima?", type: "select", options: ["Belum pernah menikah", "Belum pernah menikah atau duda/janda", "Duda/janda dapat dipertimbangkan", "Akan dibahas bersama keluarga"] },
      { name: "education", label: "Pendidikan minimal seperti apa yang Anda harapkan?", placeholder: "Contoh: SMA/sederajat, atau tidak ada syarat khusus" },
      { name: "ethnicity", label: "Apakah suku pasangan menjadi pertimbangan?", placeholder: "Contoh: tidak ada preferensi, atau jelaskan pertimbangan keluarga" },
      { name: "occupation", label: "Pekerjaan atau pola kerja seperti apa yang dapat Anda terima?", placeholder: "Contoh: pekerjaan halal; jam kerja dan lokasi dapat dibicarakan" },
      { name: "domicile", label: "Domisili pasangan yang dapat Anda pertimbangkan?", placeholder: "Contoh: Jabodetabek, seluruh Indonesia, atau bersedia LDR sementara" },
      {
        name: "religionCriteria",
        label: "Pemahaman agama dan manhaj seperti apa yang Anda harapkan?",
        type: "textarea",
        placeholder: "Jelaskan batas pemahaman yang wajib dan hal yang masih dapat dipelajari bersama.",
      },
      { name: "worshipCriteria", label: "Kebiasaan ibadah apa yang paling penting bagi Anda?", type: "textarea", placeholder: "Contoh: menjaga shalat wajib, rutin belajar agama, dan membaca Al-Qur’an." },
      { name: "characterCriteria", label: "Karakter utama apa yang Anda cari pada pasangan?", type: "textarea", placeholder: "Pilih beberapa karakter terpenting dan jelaskan alasannya." },
      { name: "communicationCriteria", label: "Gaya komunikasi dan penyelesaian konflik seperti apa yang Anda harapkan?", type: "textarea", placeholder: "Contoh: terbuka, tidak mendiamkan berkepanjangan, dan bersedia bermusyawarah." },
      { name: "familyCriteria", label: "Adakah kondisi keluarga pasangan yang perlu dipertimbangkan?", type: "textarea", placeholder: "Contoh: keterlibatan orang tua, tanggungan keluarga, atau tidak ada syarat khusus.", required: false },
      { name: "smokingCriteria", label: "Bagaimana batas Anda terkait rokok dan kebiasaan adiktif?", type: "select", options: ["Harus tidak merokok", "Sedang berhenti dapat dipertimbangkan", "Dapat dibicarakan"] },
      { name: "readinessCriteria", label: "Kesiapan menikah seperti apa yang Anda harapkan dari pasangan?", type: "textarea", placeholder: "Jelaskan kesiapan waktu, mental, keluarga, dan tanggung jawab." },
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
      { name: "husbandDuties", label: "Menurut Anda, apa kewajiban utama seorang suami?", type: "textarea", placeholder: "Jawab berdasarkan pemahaman dan praktik rumah tangga yang Anda harapkan." },
      { name: "wifeDuties", label: "Menurut Anda, apa kewajiban utama seorang istri?", type: "textarea", placeholder: "Jawab berdasarkan pemahaman dan praktik rumah tangga yang Anda harapkan." },
      { name: "husbandRights", label: "Menurut Anda, apa hak utama seorang suami?", type: "textarea", placeholder: "Jelaskan dengan bahasa Anda sendiri." },
      { name: "wifeRights", label: "Menurut Anda, apa hak utama seorang istri?", type: "textarea", placeholder: "Jelaskan dengan bahasa Anda sendiri." },
      { name: "differentOpinion", label: "Bagaimana Anda mengambil keputusan ketika pendapat suami dan istri berbeda?", type: "textarea", placeholder: "Jelaskan proses musyawarah dan batas yang Anda pahami." },
      { name: "apology", label: "Bagaimana cara Anda meminta maaf dan memulihkan hubungan?", type: "textarea", placeholder: "Ceritakan tindakan nyata yang biasa atau ingin Anda lakukan." },
      { name: "familyInterference", label: "Bagaimana Anda menetapkan batas keterlibatan keluarga besar?", type: "textarea", placeholder: "Jelaskan hal yang boleh dibantu keluarga dan yang perlu diputuskan pasangan." },
      { name: "financialDecision", label: "Bagaimana keputusan keuangan rumah tangga sebaiknya dibuat?", type: "textarea", placeholder: "Bahas keterbukaan, anggaran, nafkah, tabungan, dan utang." },
    ],
  },
  {
    key: "emotion",
    label: "Emosi & batas pribadi",
    description: "Cara mengelola emosi, menetapkan batas, dan membawa diri.",
    sensitive: true,
    fields: [
      { name: "mbti", label: "Hasil MBTI (informasi pendukung)", required: false },
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
      { name: "dailyRoutine", label: "Ceritakan kegiatan Anda sehari-hari", type: "textarea", placeholder: "Ceritakan rutinitas sejak bangun, pekerjaan, ibadah, waktu keluarga, hingga istirahat." },
      { name: "diet", label: "Pola makan", type: "textarea" },
      { name: "sleep", label: "Pola tidur", type: "textarea" },
      { name: "exercise", label: "Pola olahraga", type: "textarea" },
      { name: "socialMedia", label: "Bagaimana pandangan dan kebiasaan Anda dalam menggunakan media sosial?", type: "textarea", placeholder: "Jelaskan platform yang digunakan, kebiasaan mengunggah diri, dan batas privasi setelah menikah." },
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
