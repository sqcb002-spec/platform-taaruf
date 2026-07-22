import { CloudCog } from "lucide-react";

export function DataSyncNotice() {
  return (
    <aside className="data-sync-notice" role="status">
      <CloudCog />
      <div>
        <strong>Data terbaru sedang disinkronkan.</strong>
        <p>
          Halaman tetap dapat digunakan. Muat ulang beberapa saat lagi untuk
          melihat progres terbaru.
        </p>
      </div>
    </aside>
  );
}
