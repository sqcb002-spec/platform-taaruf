"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
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
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
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

export function RegisterForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const body = await response.json();
      setPending(false);
      if (!response.ok)
        return setError(body.error ?? "Pendaftaran belum dapat diproses.");
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
      <fieldset>
        <legend>Daftar sebagai</legend>
        <div className="role-choice">
          <label>
            <input
              type="radio"
              name="participantRole"
              value="participant_male"
              defaultChecked
            />{" "}
            Ikhwan
          </label>
          <label>
            <input
              type="radio"
              name="participantRole"
              value="participant_female"
            />{" "}
            Akhwat
          </label>
        </div>
      </fieldset>
      <label className="check">
        <input name="ageConfirmed" type="checkbox" required /> Saya berusia
        minimal 19 tahun dan berniat mengikuti proses menuju pernikahan.
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
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
