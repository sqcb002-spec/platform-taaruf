import { AuthShell } from "@/app/components/AuthShell";
import { LoginForm } from "@/app/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ oauth?: string }> }) {
  const { oauth } = await searchParams;
  const initialError = oauth === "failed" ? "Masuk dengan Google dibatalkan atau belum dapat diproses." : "";
  return <AuthShell eyebrow="RUANG PRIBADI" title="Lanjutkan ikhtiar dengan tertib." body="Masuk untuk melengkapi amanah data, meninjau arahan, dan mengikuti proses sesuai tahap Anda."><div className="auth-heading"><p className="mono">MASUK</p><h2>Assalamu’alaikum.</h2><p>Gunakan akun yang telah diverifikasi.</p></div><LoginForm initialError={initialError} /></AuthShell>;
}
