import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = "Ta’aruf Sunnah <noreply@sahabatqolbu.com>";

async function sendMail(to: string, subject: string, html: string) {
  if (!resend) return;
  await resend.emails.send({ from, to, subject, html });
}

export const auth = betterAuth({
  appName: "Ta’aruf Sunnah",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "local-development-only-change-before-production-32chars"
      : undefined),
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
          data: {
            ...user,
            displayCode: `TS-${randomBytes(4).toString("hex").toUpperCase()}`,
          },
        }),
      },
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "participant_male",
      },
      displayCode: { type: "string", required: false, input: false },
      status: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "pending_email",
      },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 12 },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(
        user.email,
        "Atur ulang kata sandi",
        `<p>Gunakan tautan berikut untuk mengatur ulang kata sandi Anda:</p><p><a href="${url}">Atur ulang kata sandi</a></p>`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail(
        user.email,
        "Verifikasi email Ta’aruf Sunnah",
        `<p>Assalamu’alaikum, ${user.name}.</p><p>Verifikasi email Anda melalui tautan berikut:</p><p><a href="${url}">Verifikasi email</a></p>`,
      );
    },
  },
  plugins: [
    twoFactor({
      issuer: "Ta’aruf Sunnah",
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendMail(
            user.email,
            "Kode keamanan akun",
            `<p>Kode keamanan Anda:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>Kode berlaku singkat. Jangan berikan kepada siapa pun.</p>`,
          );
        },
      },
    }),
    nextCookies(),
  ],
});
