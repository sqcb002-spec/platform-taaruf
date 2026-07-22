import { AuthShell } from "@/app/components/AuthShell";
import { ResetPasswordForm } from "@/app/components/RecoveryForms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <AuthShell
      eyebrow="KATA SANDI BARU"
      title="Pulihkan akses tanpa membuka data."
      body="Tautan hanya dapat digunakan sekali dan akan kedaluwarsa otomatis."
    >
      <div className="auth-heading">
        <p className="mono">KEAMANAN AKUN</p>
        <h2>Buat kata sandi baru.</h2>
        <p>Gunakan minimal 12 karakter yang unik.</p>
      </div>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
