import { requireApproved } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const member = await requireApproved();
  if (member.isAdmin) redirect("/admin/dashboard");
  if (!member.registrationCompleted) redirect("/select-profile");

  return (
    <DashboardClient
      firstName={member.firstName || member.name || "there"}
      role={member.role || "professional"}
      email={member.email!}
      isAdmin={member.isAdmin}
    />
  );
}
