import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { env } from "@/config";
import { db } from "@/db/index";
import { auditLogs, users } from "@/db/schema";

const requestedEmail = process.argv[2] ?? process.env.SEED_SUPER_ADMIN_EMAIL ?? "sqcb.002@gmail.com";
const email = requestedEmail.trim().toLowerCase();

if (!email.includes("@")) throw new Error("SEED_SUPER_ADMIN_EMAIL_INVALID");

async function seedSuperAdmin() {
  let [user] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, email)).limit(1);
  let created = false;

  if (!user) {
    const temporaryPassword = randomBytes(36).toString("base64url");
    await auth.api.signUpEmail({
      body: {
        name: "Super Admin",
        email,
        password: temporaryPassword,
      },
    });
    [user] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, email)).limit(1);
    created = true;
  }

  if (!user) throw new Error("SUPER_ADMIN_USER_NOT_CREATED");

  await db.transaction(async (tx) => {
    await tx.update(users).set({
      role: "super_admin",
      status: "active_search",
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    await tx.insert(auditLogs).values({
      actorId: user.id,
      action: created ? "super_admin.seeded" : "super_admin.promoted",
      targetType: "user",
      targetId: user.id,
      metadata: { email, previousRole: user.role, source: "seed-super-admin" },
    });
  });

  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: `${env.DASHBOARD_ORIGIN}/atur-ulang-sandi`,
    },
  });

  process.stdout.write(`Super admin ${created ? "dibuat" : "diperbarui"}: ${email}. Tautan pengaturan kata sandi telah dikirim.\n`);
}

seedSuperAdmin().catch((error) => {
  process.stderr.write(`Seed super admin gagal: ${error instanceof Error ? error.message : "UNKNOWN_ERROR"}\n`);
  process.exitCode = 1;
});
