import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, documents, users } from "@/db/schema";
import { decryptBuffer } from "@/lib/crypto";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const [record] = await db
    .select({ document: documents, ownerRole: users.role })
    .from(documents)
    .innerJoin(users, eq(users.id, documents.ownerId))
    .where(eq(documents.id, id))
    .limit(1);
  if (!record)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const viewer = session.user as typeof session.user & { role: string };
  const sameOwner = record.document.ownerId === viewer.id;
  const genderAdmin =
    (viewer.role === "admin_male" && record.ownerRole === "participant_male") ||
    (viewer.role === "admin_female" &&
      record.ownerRole === "participant_female");
  if (!sameOwner && !genderAdmin && viewer.role !== "super_admin")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const storageRoot = process.env.PRIVATE_STORAGE_PATH;
  if (!storageRoot)
    return NextResponse.json({ error: "STORAGE_UNAVAILABLE" }, { status: 503 });
  const plain = decryptBuffer(
    await readFile(path.join(storageRoot, record.document.storageKey)),
  );
  await db
    .insert(auditLogs)
    .values({
      actorId: viewer.id,
      action: "document.viewed",
      targetType: "document",
      targetId: id,
      metadata: { reason: sameOwner ? "owner" : "verification" },
    });
  return new NextResponse(new Uint8Array(plain), {
    headers: {
      "content-type": record.document.mimeType,
      "content-disposition": "inline",
      "cache-control": "private, no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}
