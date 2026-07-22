# Design — Platform Ta'aruf Sunnah

Sistem visual untuk halaman marketing dan dashboard. Karakternya tenang, amanah, matang, dan humanis; tidak menyerupai dating app atau produk permainan.

## Genre

Editorial-humanist dengan struktur proses yang jelas.

## Sistem Warna

- Warm ivory menjadi permukaan utama.
- Deep forest menjadi warna tindakan utama, identitas, dan fokus.
- Sage digunakan pada panel informasional dan privasi.
- Muted brass hanya digunakan sebagai aksen kecil, penanda, dan tujuan akad.
- Neutral memiliki sedikit chroma hangat atau hijau agar tidak terasa steril.

Nilai aktual dan seluruh semantic token berada di `tokens.css`. Komponen wajib menggunakan token tersebut, bukan nilai warna literal.

## Tipografi

- Display dan body: Plus Jakarta Sans.
- Label operasional: JetBrains Mono.
- Heading selalu tegak, tanpa italic dekoratif.

## Struktur dan Motion

- Marketing: Narrative Workflow.
- App/dashboard: grid operasional yang tenang dan padat informasi.
- Motion hanya mengubah opacity atau transform, memiliki reduced-motion fallback, dan tidak boleh mengalihkan perhatian dari isi.

## Komponen yang Wajib Konsisten

- Wordmark, header, CTA, focus ring, dan footer.
- Radius, spacing scale, serta hierarchy heading.
- Deep forest untuk primary CTA; brass tidak boleh menjadi fill section besar.
