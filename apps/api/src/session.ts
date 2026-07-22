import type { Request } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/roles";

export async function getSession(req: Request) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return null;
  return {
    ...session,
    user: session.user as typeof session.user & {
      role: AppRole;
      displayCode: string;
      status: string;
    },
  };
}
