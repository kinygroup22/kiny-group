// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayoutWrapper } from "@/components/dashboard/layout/dashboard-layout-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayoutWrapper user={user}>
      {children}
    </DashboardLayoutWrapper>
  );
}