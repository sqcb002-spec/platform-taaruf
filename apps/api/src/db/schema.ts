import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", [
  "participant_male",
  "participant_female",
  "guardian",
  "admin_male",
  "admin_female",
  "mediator",
  "super_admin",
]);
export const accountStatus = pgEnum("account_status", [
  "pending_email",
  "pending_identity",
  "profile_incomplete",
  "under_review",
  "active_search",
  "focused",
  "active_taaruf",
  "cooldown",
  "khitbah",
  "preparing_marriage",
  "married",
  "self_inactive",
  "suspended",
  "archived",
]);
export const reviewStatus = pgEnum("review_status", [
  "pending",
  "processing",
  "needs_revision",
  "approved",
  "rejected",
]);
export const sectionStatus = pgEnum("section_status", [
  "empty",
  "partial",
  "complete",
  "pending_review",
  "verified",
]);
export const processStatus = pgEnum("process_status", [
  "awaiting_recipient",
  "istikharah",
  "awaiting_guardian",
  "active_taaruf",
  "reference_check",
  "structured_dialogue",
  "nazhor_scheduling",
  "nazhor",
  "khitbah",
  "preparing_marriage",
  "married",
  "withdrawn",
  "expired",
  "closed",
]);
export const notificationChannel = pgEnum("notification_channel", [
  "in_app",
  "email",
]);
export const documentKind = pgEnum("document_kind", [
  "identity_card",
  "identity_selfie",
  "profile_photo",
]);
export const jobStatus = pgEnum("job_status", [
  "queued",
  "running",
  "completed",
  "failed",
]);

// Better Auth core tables.
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: role("role").default("participant_male").notNull(),
    displayCode: text("display_code").notNull(),
    status: accountStatus("status").default("pending_email").notNull(),
    phone: text("phone"),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_display_code_idx").on(table.displayCode),
  ],
);
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("sessions_token_idx").on(table.token),
    index("sessions_user_idx").on(table.userId),
  ],
);
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
export const twoFactors = pgTable("two_factors", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  birthDate: timestamp("birth_date", { withTimezone: true }),
  province: text("province"),
  city: text("city"),
  originCity: text("origin_city"),
  ethnicity: text("ethnicity"),
  maritalStatus: text("marital_status"),
  educationLevel: text("education_level"),
  occupationField: text("occupation_field"),
  manhaj: text("manhaj"),
  marriageTargetMonths: integer("marriage_target_months"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  completionPercent: integer("completion_percent").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const profileSections = pgTable(
  "profile_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    status: sectionStatus("status").default("empty").notNull(),
    formVersion: text("form_version").default("1.0").notNull(),
    answers: jsonb("answers").default({}).notNull(),
    encryptedAnswers: text("encrypted_answers"),
    reviewedBy: text("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("profile_sections_user_key_idx").on(table.userId, table.key),
  ],
);
export const participantReferences = pgTable("participant_references", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  nameEncrypted: text("name_encrypted").notNull(),
  relationship: text("relationship").notNull(),
  phoneEncrypted: text("phone_encrypted").notNull(),
  knownYears: integer("known_years").notNull(),
  status: reviewStatus("status").default("pending").notNull(),
  checkedBy: text("checked_by").references(() => users.id),
  notesEncrypted: text("notes_encrypted"),
});
export const guardianships = pgTable("guardianships", {
  id: uuid("id").defaultRandom().primaryKey(),
  femaleParticipantId: text("female_participant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  guardianId: text("guardian_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  status: reviewStatus("status").default("pending").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: documentKind("kind").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  contentHash: text("content_hash").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: reviewStatus("status").default("pending").notNull(),
  ocrResultEncrypted: text("ocr_result_encrypted"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  purgeAfter: timestamp("purge_after", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const partnerPreferences = pgTable("partner_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  minAge: integer("min_age").notNull(),
  maxAge: integer("max_age").notNull(),
  provinces: jsonb("provinces").default([]).notNull(),
  educationLevels: jsonb("education_levels").default([]).notNull(),
  maritalStatuses: jsonb("marital_statuses").default([]).notNull(),
  criteria: jsonb("criteria").default({}).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    candidateId: text("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: real("score").notNull(),
    reasons: jsonb("reasons").default([]).notNull(),
    source: text("source").default("system").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("recommendations_pair_idx").on(table.userId, table.candidateId),
  ],
);
export const taarufProcesses = pgTable("taaruf_processes", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposerId: text("proposer_id")
    .notNull()
    .references(() => users.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  maleParticipantId: text("male_participant_id")
    .notNull()
    .references(() => users.id),
  femaleParticipantId: text("female_participant_id")
    .notNull()
    .references(() => users.id),
  guardianId: text("guardian_id").references(() => users.id),
  mediatorId: text("mediator_id").references(() => users.id),
  status: processStatus("status").default("awaiting_recipient").notNull(),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }),
  closedReason: text("closed_reason"),
  archiveUntil: timestamp("archive_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const consents = pgTable("consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  processId: uuid("process_id")
    .notNull()
    .references(() => taarufProcesses.id, { onDelete: "cascade" }),
  actorId: text("actor_id")
    .notNull()
    .references(() => users.id),
  kind: text("kind").notNull(),
  decision: text("decision").notNull(),
  policyVersion: text("policy_version").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  decidedAt: timestamp("decided_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const processEvents = pgTable("process_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  processId: uuid("process_id")
    .notNull()
    .references(() => taarufProcesses.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => users.id),
  type: text("type").notNull(),
  visibility: text("visibility").default("participants").notNull(),
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const structuredMessages = pgTable("structured_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  processId: uuid("process_id")
    .notNull()
    .references(() => taarufProcesses.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  promptKey: text("prompt_key").notNull(),
  bodyEncrypted: text("body_encrypted").notNull(),
  moderationStatus: reviewStatus("moderation_status")
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const nazhorAppointments = pgTable("nazhor_appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  processId: uuid("process_id")
    .notNull()
    .references(() => taarufProcesses.id, { onDelete: "cascade" })
    .unique(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  locationEncrypted: text("location_encrypted").notNull(),
  attendance: jsonb("attendance").default([]).notNull(),
  status: text("status").default("scheduled").notNull(),
});
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href"),
  channel: notificationChannel("channel").default("in_app").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const moderationCases = pgTable("moderation_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => users.id),
  reporterId: text("reporter_id").references(() => users.id),
  assignedTo: text("assigned_to").references(() => users.id),
  kind: text("kind").notNull(),
  status: text("status").default("open").notNull(),
  reasonEncrypted: text("reason_encrypted").notNull(),
  restrictedUntil: timestamp("restricted_until", { withTimezone: true }),
  reviewedBy: text("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").default("draft").notNull(),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const policyAcceptances = pgTable("policy_acceptances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  policyId: uuid("policy_id")
    .notNull()
    .references(() => policies.id),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});
export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  payload: jsonb("payload").default({}).notNull(),
  status: jobStatus("status").default("queued").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  availableAt: timestamp("available_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
