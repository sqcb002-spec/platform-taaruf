import { AuthShell } from "@/app/components/AuthShell";
import { ForgotPasswordForm } from "@/app/components/RecoveryForms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="PEMULIHAN AKUN"
      title="Kembali dengan langkah yang aman."
      body="Instruksi hanya dikirim ke email yang terhubung dengan akun."
    >
      <div className="auth-heading">
        <p className="mono">LUPA KATA SANDI</p>
        <h2>Masukkan email akun.</h2>
        <p>Kami tidak akan mengungkap apakah email terdaftar.</p>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
