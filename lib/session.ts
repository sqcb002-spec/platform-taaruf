import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/roles";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/masuk");
  return {
    ...session,
    user: session.user as typeof session.user & {
      role: AppRole;
      displayCode: string;
      status: string;
    },
  };
}
