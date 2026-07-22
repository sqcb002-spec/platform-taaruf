import { AuthShell } from "@/app/components/AuthShell";
import { StaffOtpForm } from "@/app/components/RecoveryForms";

export default function StaffVerificationPage() {
  return (
    <AuthShell
      eyebrow="LAPIS KEAMANAN KEDUA"
      title="Akses aman untuk pemegang amanah."
      body="Akun staf wajib mengonfirmasi kode sekali pakai sebelum memperoleh akses data operasional."
    >
      <div className="auth-heading">
        <p className="mono">OTP EMAIL</p>
        <h2>Verifikasi sesi staf.</h2>
        <p>Kode berlaku singkat dan tidak boleh diberikan kepada siapa pun.</p>
      </div>
      <StaffOtpForm />
    </AuthShell>
  );
}
