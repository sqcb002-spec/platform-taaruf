import { and, count, eq, inArray, or } from "drizzle-orm";
import { transactionalDb as db } from "@/db";
import {
  auditLogs,
  consents,
  guardianships,
  notifications,
  processEvents,
  taarufProcesses,
  users,
} from "@/db/schema";

const activeStatuses = [
  "active_taaruf",
  "reference_check",
  "structured_dialogue",
  "nazhor_scheduling",
  "nazhor",
  "khitbah",
  "preparing_marriage",
] as const;
const pendingStatuses = [
  "awaiting_recipient",
  "istikharah",
  "awaiting_guardian",
] as const;

export async function createProposal(
  actorId: string,
  candidateId: string,
  policyVersion: string,
) {
  return db.transaction(async (tx) => {
    const participantRows = await tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        displayCode: users.displayCode,
      })
      .from(users)
      .where(inArray(users.id, [actorId, candidateId]));
    if (participantRows.length !== 2) throw new Error("PARTICIPANT_NOT_FOUND");
    const actor = participantRows.find((row) => row.id === actorId)!;
    const candidate = participantRows.find((row) => row.id === candidateId)!;
    if (
      !actor.role.startsWith("participant_") ||
      !candidate.role.startsWith("participant_") ||
      actor.role === candidate.role
    )
      throw new Error("INELIGIBLE_PAIR");
    const actorIsTest = actor.displayCode.startsWith("TEST-");
    const candidateIsTest = candidate.displayCode.startsWith("TEST-");
    if (actorIsTest !== candidateIsTest) throw new Error("TEST_ACCOUNT_ISOLATED");
    if (
      actor.status !== "active_search" ||
      candidate.status !== "active_search"
    )
      throw new Error("PARTICIPANT_NOT_SEARCHABLE");
    const [active] = await tx
      .select({ value: count() })
      .from(taarufProcesses)
      .where(
        and(
          or(
            eq(taarufProcesses.maleParticipantId, actorId),
            eq(taarufProcesses.femaleParticipantId, actorId),
            eq(taarufProcesses.maleParticipantId, candidateId),
            eq(taarufProcesses.femaleParticipantId, candidateId),
          ),
          inArray(taarufProcesses.status, [...activeStatuses]),
        ),
      );
    if (active.value > 0) throw new Error("ACTIVE_PROCESS_EXISTS");
    const [pending] = await tx
      .select({ value: count() })
      .from(taarufProcesses)
      .where(
        and(
          eq(taarufProcesses.proposerId, actorId),
          inArray(taarufProcesses.status, [...pendingStatuses]),
        ),
      );
    if (pending.value >= 3) throw new Error("PENDING_PROPOSAL_LIMIT");
    const maleId = actor.role === "participant_male" ? actor.id : candidate.id;
    const femaleId =
      actor.role === "participant_female" ? actor.id : candidate.id;
    const [guardian] = await tx
      .select({ id: guardianships.guardianId })
      .from(guardianships)
      .where(
        and(
          eq(guardianships.femaleParticipantId, femaleId),
          eq(guardianships.status, "approved"),
        ),
      )
      .limit(1);
    const [process] = await tx
      .insert(taarufProcesses)
      .values({
        proposerId: actorId,
        recipientId: candidateId,
        maleParticipantId: maleId,
        femaleParticipantId: femaleId,
        guardianId: guardian?.id,
        deadlineAt: new Date(Date.now() + 3 * 86400000),
      })
      .returning();
    await tx
      .insert(consents)
      .values({
        processId: process.id,
        actorId,
        kind: "participant_intent",
        decision: "granted",
        policyVersion,
      });
    await tx
      .insert(processEvents)
      .values({
        processId: process.id,
        actorId,
        type: "proposal.created",
        payload: { deadlineAt: process.deadlineAt },
      });
    await tx
      .insert(notifications)
      .values({
        userId: candidateId,
        type: "proposal.received",
        title: "Pengajuan ta’aruf baru",
        body: "Tinjau biodata terbatas dan berikan keputusan dalam tiga hari.",
        href: `/dashboard/pengajuan/${process.id}`,
      });
    await tx
      .insert(auditLogs)
      .values({
        actorId,
        action: "proposal.created",
        targetType: "taaruf_process",
        targetId: process.id,
        metadata: { recipientId: candidateId, policyVersion },
      });
    return process;
  });
}

export async function decideProposal(
  actorId: string,
  processId: string,
  decision: "accept" | "reject" | "istikharah",
  policyVersion: string,
) {
  return db.transaction(async (tx) => {
    const [process] = await tx
      .select()
      .from(taarufProcesses)
      .where(eq(taarufProcesses.id, processId))
      .limit(1);
    if (
      !process ||
      process.recipientId !== actorId ||
      !["awaiting_recipient", "istikharah"].includes(process.status)
    )
      throw new Error("INVALID_DECISION");
    if (decision === "reject") {
      await tx
        .update(taarufProcesses)
        .set({
          status: "closed",
          closedReason: "recipient_rejected",
          archiveUntil: new Date(Date.now() + 365 * 86400000),
          updatedAt: new Date(),
        })
        .where(eq(taarufProcesses.id, processId));
    } else if (decision === "istikharah") {
      await tx
        .update(taarufProcesses)
        .set({
          status: "istikharah",
          deadlineAt: new Date(Date.now() + 7 * 86400000),
          updatedAt: new Date(),
        })
        .where(eq(taarufProcesses.id, processId));
    } else {
      if (!process.guardianId) throw new Error("GUARDIAN_NOT_VERIFIED");
      await tx
        .update(taarufProcesses)
        .set({
          status: "awaiting_guardian",
          deadlineAt: new Date(Date.now() + 3 * 86400000),
          updatedAt: new Date(),
        })
        .where(eq(taarufProcesses.id, processId));
      await tx
        .insert(notifications)
        .values({
          userId: process.guardianId,
          type: "guardian.consent.required",
          title: "Persetujuan wali diperlukan",
          body: "Kedua peserta telah menyatakan kesediaan. Tinjau calon dan SOP sebelum memutuskan.",
          href: `/dashboard/persetujuan/${process.id}`,
        });
    }
    await tx
      .insert(consents)
      .values({
        processId,
        actorId,
        kind: "recipient_decision",
        decision,
        policyVersion,
      });
    await tx
      .insert(processEvents)
      .values({
        processId,
        actorId,
        type: `recipient.${decision}`,
        payload: {},
      });
    await tx.insert(notifications).values({
      userId: process.proposerId,
      type: `proposal.${decision}`,
      title: decision === "reject" ? "Pengajuan tidak dilanjutkan" : decision === "istikharah" ? "Calon memilih istikharah" : "Calon bersedia melanjutkan",
      body: decision === "reject"
        ? "Proses ditutup dengan baik. Anda dapat kembali meninjau rekomendasi setelah masa jeda."
        : decision === "istikharah"
          ? "Calon membutuhkan waktu untuk istikharah sebelum memberikan keputusan."
          : "Persetujuan calon tercatat. Proses berikutnya menunggu keputusan wali.",
      href: "/dashboard/proses",
    });
    return { status: decision };
  });
}

export async function decideGuardian(
  actorId: string,
  processId: string,
  decision: "accept" | "reject",
  policyVersion: string,
) {
  return db.transaction(async (tx) => {
    const [process] = await tx
      .select()
      .from(taarufProcesses)
      .where(eq(taarufProcesses.id, processId))
      .limit(1);
    if (
      !process ||
      process.guardianId !== actorId ||
      process.status !== "awaiting_guardian"
    )
      throw new Error("INVALID_GUARDIAN_DECISION");
    const nextStatus = decision === "accept" ? "active_taaruf" : "closed";
    await tx
      .update(taarufProcesses)
      .set({
        status: nextStatus,
        deadlineAt:
          decision === "accept" ? new Date(Date.now() + 7 * 86400000) : null,
        closedReason: decision === "reject" ? "guardian_rejected" : null,
        archiveUntil:
          decision === "reject" ? new Date(Date.now() + 365 * 86400000) : null,
        updatedAt: new Date(),
      })
      .where(eq(taarufProcesses.id, processId));
    if (decision === "accept") {
      await tx
        .update(users)
        .set({ status: "active_taaruf", updatedAt: new Date() })
        .where(
          inArray(users.id, [
            process.maleParticipantId,
            process.femaleParticipantId,
          ]),
        );
      await tx
        .update(taarufProcesses)
        .set({
          status: "closed",
          closedReason: "another_process_activated",
          archiveUntil: new Date(Date.now() + 365 * 86400000),
          updatedAt: new Date(),
        })
        .where(
          and(
            or(
              eq(taarufProcesses.proposerId, process.maleParticipantId),
              eq(taarufProcesses.recipientId, process.maleParticipantId),
              eq(taarufProcesses.proposerId, process.femaleParticipantId),
              eq(taarufProcesses.recipientId, process.femaleParticipantId),
            ),
            inArray(taarufProcesses.status, [...pendingStatuses]),
          ),
        );
    }
    await tx
      .insert(consents)
      .values({
        processId,
        actorId,
        kind: "guardian_decision",
        decision,
        policyVersion,
      });
    await tx
      .insert(processEvents)
      .values({
        processId,
        actorId,
        type: `guardian.${decision}`,
        payload: {},
      });
    await tx.insert(notifications).values([
      {
        userId: process.maleParticipantId,
        type: `guardian.${decision}`,
        title: decision === "accept" ? "Wali menyetujui proses" : "Wali tidak menyetujui proses",
        body: decision === "accept" ? "Ta’aruf kini aktif dan akan dilanjutkan bersama mediator." : "Proses ditutup sesuai keputusan wali.",
        href: "/dashboard/proses",
      },
      {
        userId: process.femaleParticipantId,
        type: `guardian.${decision}`,
        title: decision === "accept" ? "Wali menyetujui proses" : "Wali tidak menyetujui proses",
        body: decision === "accept" ? "Ta’aruf kini aktif dan akan dilanjutkan bersama mediator." : "Proses ditutup sesuai keputusan wali.",
        href: "/dashboard/proses",
      },
    ]);
    return { status: nextStatus };
  });
}

export async function withdrawProcess(
  actorId: string,
  processId: string,
  reason: string,
) {
  return db.transaction(async (tx) => {
    const [process] = await tx
      .select()
      .from(taarufProcesses)
      .where(eq(taarufProcesses.id, processId))
      .limit(1);
    if (
      !process ||
      ![process.maleParticipantId, process.femaleParticipantId].includes(actorId) ||
      ["closed", "withdrawn", "expired", "married"].includes(process.status)
    ) throw new Error("INVALID_WITHDRAWAL");

    await tx
      .update(taarufProcesses)
      .set({
        status: "withdrawn",
        closedReason: reason,
        deadlineAt: null,
        archiveUntil: new Date(Date.now() + 365 * 86400000),
        updatedAt: new Date(),
      })
      .where(eq(taarufProcesses.id, processId));
    await tx.insert(processEvents).values({
      processId,
      actorId,
      type: "process.withdrawn",
      payload: { reason },
    });
    const otherParticipantId = process.maleParticipantId === actorId
      ? process.femaleParticipantId
      : process.maleParticipantId;
    await tx.insert(notifications).values({
      userId: otherParticipantId,
      type: "process.withdrawn",
      title: "Proses ta’aruf telah ditutup",
      body: "Pihak lain memilih tidak melanjutkan proses. Data tetap dijaga dan komunikasi tidak dibuka.",
      href: "/dashboard/proses",
    });
    await tx.insert(auditLogs).values({
      actorId,
      action: "process.withdrawn",
      targetType: "taaruf_process",
      targetId: processId,
      metadata: { reason },
    });
    return { status: "withdrawn" as const };
  });
}
