"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/api-client";

type ParticipantRole = "participant_male" | "participant_female";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="google-mark">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.37l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.54l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  );
}

function useGoogleAvailability() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiUrl}/api/public/auth-providers`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => setEnabled(body?.data?.google === true))
      .catch((error) => {
        if (error?.name !== "AbortError") setEnabled(false);
      });
    return () => controller.abort();
  }, []);
  return enabled;
}

function GoogleAuthButton({
  mode,
  participantRole,
  ageConfirmed,
  onError,
}: {
  mode: "login" | "register";
  participantRole?: ParticipantRole;
  ageConfirmed?: boolean;
  onError: (message: string) => void;
}) {
  const enabled = useGoogleAvailability();
  const [pending, setPending] = useState(false);

  if (!enabled) return null;

  async function continueWithGoogle() {
    if (mode === "register" && !ageConfirmed) {
      onError("Konfirmasikan usia dan niat mengikuti proses sebelum mendaftar dengan Google.");
      return;
    }
    setPending(true);
    onError("");
    const origin = window.location.origin;
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${origin}/dashboard`,
        errorCallbackURL: `${origin}/${mode === "register" ? "daftar" : "masuk"}?oauth=failed`,
        newUserCallbackURL: `${origin}/dashboard`,
        requestSignUp: mode === "register",
        additionalData: mode === "register" ? {
          participantRole,
          ageConfirmed: true,
        } : undefined,
      });
      if (result.error) {
        setPending(false);
        onError(result.error.message ?? "Google belum dapat digunakan untuk masuk.");
      }
    } catch {
      setPending(false);
      onError("Koneksi ke Google belum dapat dimulai. Silakan coba kembali.");
    }
  }

  return (
    <button type="button" className="google-auth-button" onClick={continueWithGoogle} disabled={pending} aria-busy={pending}>
      {pending ? <LoaderCircle className="spin" /> : <GoogleMark />}
      {pending ? "Menghubungkan ke Google…" : `${mode === "register" ? "Daftar" : "Masuk"} dengan Google`}
    </button>
  );
}

function AuthDivider({ label }: { label: string }) {
  return <div className="auth-divider"><span>{label}</span></div>;
}

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email")),
        password: String(data.get("password")),
        rememberMe: true,
      });
      if (result.error) {
        setPending(false);
        return setError(
          result.error.message ?? "Email atau kata sandi tidak sesuai.",
        );
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setPending(false);
      return setError(
        "Koneksi terputus sesaat. Silakan coba masuk kembali.",
      );
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <GoogleAuthButton mode="login" onError={setError} />
      <AuthDivider label="atau masuk dengan email" />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
        />
      </label>
      <label>
        Kata sandi
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          placeholder="Minimal 12 karakter"
        />
      </label>
      <button className="auth-submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="spin" /> Menyiapkan dashboard…
          </>
        ) : (
          <>
            Masuk ke dashboard <ArrowRight />
          </>
        )}
      </button>
      <div className="auth-links">
        <Link href="/lupa-sandi">Lupa kata sandi?</Link>
        <Link href="/daftar">Belum punya akun</Link>
      </div>
    </form>
  );
}

export function RegisterForm({ initialError = "" }: { initialError?: string }) {
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [participantRole, setParticipantRole] = useState<ParticipantRole>("participant_male");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const body = await response.json();
      setPending(false);
      if (!response.ok)
        return setError(body?.error?.message ?? "Pendaftaran belum dapat diproses.");
      setSent(true);
    } catch {
      setPending(false);
      setError("Koneksi terputus sesaat. Silakan coba kembali.");
    }
  }
  if (sent)
    return (
      <div className="auth-success">
        <strong>Periksa email Anda.</strong>
        <p>
          Tautan verifikasi telah dikirim. Setelah verifikasi, masuk untuk
          melanjutkan identitas dan biodata.
        </p>
        <Link href="/masuk">Kembali ke halaman masuk →</Link>
      </div>
    );
  return (
    <form className="auth-form" onSubmit={submit}>
      <fieldset>
        <legend>Daftar sebagai</legend>
        <div className="role-choice">
          <label>
            <input
              type="radio"
              name="participantRole"
              value="participant_male"
              checked={participantRole === "participant_male"}
              onChange={() => setParticipantRole("participant_male")}
            />{" "}
            Ikhwan
          </label>
          <label>
            <input
              type="radio"
              name="participantRole"
              value="participant_female"
              checked={participantRole === "participant_female"}
              onChange={() => setParticipantRole("participant_female")}
            />{" "}
            Akhwat
          </label>
        </div>
      </fieldset>
      <label className="check">
        <input name="ageConfirmed" type="checkbox" required checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} /> Saya berusia
        minimal 19 tahun dan berniat mengikuti proses menuju pernikahan.
      </label>
      <GoogleAuthButton mode="register" participantRole={participantRole} ageConfirmed={ageConfirmed} onError={setError} />
      <AuthDivider label="atau daftar dengan email" />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <label>
        Nama panggilan
        <input name="name" required maxLength={60} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Kata sandi
        <input
          name="password"
          type="password"
          minLength={12}
          maxLength={128}
          required
          autoComplete="new-password"
        />
      </label>
      <button className="auth-submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="spin" /> Membuat akun…
          </>
        ) : (
          <>
            Buat akun <ArrowRight />
          </>
        )}
      </button>
      <p className="auth-note">
        Setelah mendaftar, periksa email untuk verifikasi akun.
      </p>
    </form>
  );
}
