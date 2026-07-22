function Line({ className = "" }: { className?: string }) {
  return <span className={`skeleton-block ${className}`} />;
}

export function AppLoadingSkeleton() {
  return (
    <main className="global-loading-shell" aria-busy="true" aria-label="Memuat halaman">
      <div className="global-loading-brand">
        <Line className="skeleton-logo" />
        <Line className="skeleton-brand-name" />
      </div>
      <section className="global-loading-card">
        <Line className="skeleton-kicker" />
        <Line className="skeleton-title skeleton-title-wide" />
        <Line className="skeleton-title" />
        <Line className="skeleton-copy" />
        <Line className="skeleton-copy skeleton-copy-short" />
        <Line className="skeleton-button" />
      </section>
      <p className="loading-assurance">Menyiapkan ruang yang aman untuk Anda…</p>
    </main>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="dashboard-loading" aria-busy="true" aria-label="Memuat data dashboard">
      <div className="dashboard-loading-heading">
        <div>
          <Line className="skeleton-kicker" />
          <Line className="skeleton-title skeleton-dashboard-title" />
          <Line className="skeleton-copy" />
        </div>
        <Line className="skeleton-button skeleton-heading-action" />
      </div>
      <div className="skeleton-focus-card">
        <div>
          <Line className="skeleton-chip" />
          <Line className="skeleton-title skeleton-focus-title" />
          <Line className="skeleton-copy skeleton-on-dark" />
          <Line className="skeleton-button skeleton-on-dark" />
        </div>
        <Line className="skeleton-orbit" />
      </div>
      <div className="skeleton-metrics">
        {[0, 1, 2].map((item) => (
          <div className="skeleton-metric" key={item}>
            <Line className="skeleton-metric-icon" />
            <div>
              <Line className="skeleton-kicker" />
              <Line className="skeleton-copy skeleton-copy-short" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-dashboard-columns">
        <Line className="skeleton-panel" />
        <Line className="skeleton-panel skeleton-panel-short" />
      </div>
      <p className="loading-assurance">Mengambil data terbaru dan menjaga sesi Anda…</p>
    </div>
  );
}
