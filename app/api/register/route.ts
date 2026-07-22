import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const registration = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12).max(128),
  participantRole: z.enum(["participant_male", "participant_female"]),
  ageConfirmed: z.literal("on"),
});

export async function POST(request: Request) {
  const parsed = registration.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Periksa kembali data pendaftaran." },
      { status: 400 },
    );
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    if (!result.user?.id) throw new Error("USER_NOT_CREATED");
    await db
      .update(users)
      .set({ role: parsed.data.participantRole })
      .where(eq(users.id, result.user.id));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("registration.failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      {
        error: "Email mungkin sudah terdaftar atau permintaan terlalu sering.",
      },
      { status: 409 },
    );
  }
}
