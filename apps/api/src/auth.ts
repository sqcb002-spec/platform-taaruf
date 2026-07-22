import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { env } from "@/config";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function sendMail(to: string, subject: string, html: string) {
  if (!resend) {
    if (env.NODE_ENV === "production") throw new Error("RESEND_NOT_CONFIGURED");
    return;
  }
  const result = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
  if (result.error) throw new Error(`EMAIL_SEND_FAILED:${result.error.message}`);
}

export const auth = betterAuth({
  appName: "Ta’aruf Sunnah",
  baseURL: env.API_PUBLIC_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.DASHBOARD_ORIGIN, env.LANDING_ORIGIN],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      twoFactor: schema.twoFactors,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, displayCode: `TS-${randomBytes(4).toString("hex").toUpperCase()}` },
        }),
      },
    },
  },
  advanced: { useSecureCookies: env.NODE_ENV === "production" },
  user: {
    modelName: "users",
    additionalFields: {
      role: { type: "string", required: false, input: false, defaultValue: "participant_male" },
      displayCode: { type: "string", required: false, input: false },
      status: { type: "string", required: false, input: false, defaultValue: "pending_email" },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 12,
    cookieCache: { enabled: true, maxAge: 60 * 5, strategy: "compact" },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => sendMail(user.email, "Atur ulang kata sandi", `<p>Gunakan tautan berikut untuk mengatur ulang kata sandi Anda:</p><p><a href="${url}">Atur ulang kata sandi</a></p>`),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => sendMail(user.email, "Verifikasi email Ta’aruf Sunnah", `<p>Assalamu’alaikum, ${user.name}.</p><p>Verifikasi email Anda melalui tautan berikut:</p><p><a href="${url}">Verifikasi email</a></p>`),
  },
  plugins: [
    twoFactor({
      issuer: "Ta’aruf Sunnah",
      otpOptions: { sendOTP: async ({ user, otp }) => sendMail(user.email, "Kode keamanan akun", `<p>Kode keamanan Anda:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>`) },
    }),
  ],
});
