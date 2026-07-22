import Link from "next/link";

export function AuthShell({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark">ت</span>
          <span>
            Ta’aruf <b>Sunnah</b>
          </span>
        </Link>
        <div>
          <p className="mono">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
        <p className="auth-principle">
          Tanpa swipe · Tanpa chat bebas · Satu proses aktif
        </p>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
