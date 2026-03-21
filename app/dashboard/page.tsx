import { requireApproved } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const member = await requireApproved();
  if (member.isAdmin) redirect("/admin/dashboard");

  return (
    <DashboardClient
      firstName={member.firstName || member.name || "Member"}
      role={member.role || "professional"}
      email={member.email!}
      isAdmin={member.isAdmin}
    />
  );
}
