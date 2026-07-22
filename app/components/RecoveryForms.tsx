"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/atur-ulang-sandi",
    });
    setState("sent");
  }
  if (state === "sent")
    return (
      <div className="auth-success">
        <strong>Periksa email Anda.</strong>
        <p>
          Jika alamat tersebut terdaftar, instruksi pengaturan ulang kata sandi
          akan segera tiba.
        </p>
      </div>
    );
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Email akun
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <button className="auth-submit" disabled={state === "loading"}>
        {state === "loading" ? (
          <LoaderCircle className="spin" />
        ) : (
          <>
            Kirim instruksi <ArrowRight />
          </>
        )}
      </button>
    </form>
  );
}

export function StaffOtpForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    const result = await authClient.twoFactor.sendOtp({});
    if (result.error) return setError("Kode belum dapat dikirim.");
    setSent(true);
  }
  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code"));
    const result = await authClient.twoFactor.verifyOtp({
      code,
      trustDevice: false,
    });
    if (result.error)
      return setError("Kode tidak sesuai atau telah kedaluwarsa.");
    window.location.href = "/dashboard";
  }
  return (
    <div className="auth-form">
      {sent ? (
        <form className="auth-form" onSubmit={verify}>
          <label>
            Kode keamanan
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoComplete="one-time-code"
            />
          </label>
          <button className="auth-submit">
            Verifikasi kode <ArrowRight />
          </button>
        </form>
      ) : (
        <button className="auth-submit" onClick={send}>
          Kirim kode ke email <ArrowRight />
        </button>
      )}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmation"))) return setState("error");
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setState(result.error ? "error" : "done");
  }
  if (!token)
    return (
      <p className="form-error">
        Tautan reset tidak valid atau telah kedaluwarsa.
      </p>
    );
  if (state === "done")
    return (
      <div className="auth-success">
        <strong>Kata sandi telah diperbarui.</strong>
        <p>Silakan masuk kembali menggunakan kata sandi baru.</p>
        <a href="/masuk">Masuk ke akun →</a>
      </div>
    );
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Kata sandi baru
        <input
          name="password"
          type="password"
          minLength={12}
          maxLength={128}
          required
          autoComplete="new-password"
        />
      </label>
      <label>
        Konfirmasi kata sandi
        <input
          name="confirmation"
          type="password"
          minLength={12}
          maxLength={128}
          required
          autoComplete="new-password"
        />
      </label>
      {state === "error" ? (
        <p className="form-error">
          Tautan tidak valid atau kedua kata sandi belum sesuai.
        </p>
      ) : null}
      <button className="auth-submit" disabled={state === "loading"}>
        {state === "loading" ? (
          <LoaderCircle className="spin" />
        ) : (
          <>
            Simpan kata sandi <ArrowRight />
          </>
        )}
      </button>
    </form>
  );
}
