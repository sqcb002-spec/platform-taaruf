import { AuthShell } from "@/app/components/AuthShell";
import { RegisterForm } from "@/app/components/AuthForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ oauth?: string }> }) {
  const { oauth } = await searchParams;
  const initialError = oauth === "failed" ? "Pendaftaran dengan Google dibatalkan atau belum dapat diproses." : "";
  return <AuthShell eyebrow="LANGKAH PERTAMA" title="Biodata jujur sebelum memilih." body="Akun baru menjalani verifikasi email, identitas, nomor HP, biodata, wali untuk akhwat, dan tiga referensi."><div className="auth-heading"><p className="mono">PENDAFTARAN</p><h2>Mulai dengan niat yang jelas.</h2><p>Seluruh proses dasar tersedia tanpa biaya.</p></div><RegisterForm initialError={initialError} /></AuthShell>;
}
