import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().min(1).optional(),
);

const environment = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3003),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  API_PUBLIC_URL: z.string().url().default("http://localhost:3003"),
  DASHBOARD_ORIGIN: z.string().url().default("http://localhost:3001"),
  LANDING_ORIGIN: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: optionalSecret,
  GOOGLE_CLIENT_SECRET: optionalSecret,
  EMAIL_FROM: z.string().default("Ta’aruf Sunnah <noreply@platformtaarufsunnah.my.id>"),
  PRIVATE_STORAGE_PATH: z.string().optional(),
  DOCUMENT_ENCRYPTION_KEY: z.string().optional(),
  NIK_HMAC_KEY: z.string().optional(),
}).superRefine((value, context) => {
  if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) {
    context.addIssue({
      code: "custom",
      message: "GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET wajib diisi berpasangan.",
      path: ["GOOGLE_CLIENT_ID"],
    });
  }
});

export const env = environment.parse(process.env);
export const allowedOrigins = new Set([env.DASHBOARD_ORIGIN, env.LANDING_ORIGIN]);
export const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
