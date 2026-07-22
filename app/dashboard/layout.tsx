import { DashboardShell } from "@/app/components/DashboardShell";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSession();
  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        displayCode: user.displayCode,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
