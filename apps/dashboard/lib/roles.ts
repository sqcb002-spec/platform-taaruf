export const participantRoles = [
  "participant_male",
  "participant_female",
] as const;
export const staffRoles = [
  "admin_male",
  "admin_female",
  "mediator",
  "super_admin",
] as const;
export type AppRole =
  (typeof participantRoles)[number] | (typeof staffRoles)[number] | "guardian";

export const roleLabels: Record<AppRole, string> = {
  participant_male: "Peserta Ikhwan",
  participant_female: "Peserta Akhwat",
  guardian: "Wali",
  admin_male: "Admin Ikhwan",
  admin_female: "Admin Akhwat",
  mediator: "Mediator",
  super_admin: "Super Admin",
};

export function isStaff(role: string): role is (typeof staffRoles)[number] {
  return staffRoles.includes(role as (typeof staffRoles)[number]);
}
