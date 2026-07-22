"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003",
  fetchOptions: { credentials: "include" },
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/masuk/verifikasi";
      },
    }),
  ],
});
