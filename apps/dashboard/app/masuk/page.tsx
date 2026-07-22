import { AuthShell } from "@/app/components/AuthShell";
import { LoginForm } from "@/app/components/AuthForm";

export default function LoginPage() {
  return <AuthShell eyebrow="RUANG PRIBADI" title="Lanjutkan ikhtiar dengan tertib." body="Masuk untuk melengkapi amanah data, meninjau arahan, dan mengikuti proses sesuai tahap Anda."><div className="auth-heading"><p className="mono">MASUK</p><h2>Assalamu’alaikum.</h2><p>Gunakan akun yang telah diverifikasi.</p></div><LoginForm /></AuthShell>;
}
