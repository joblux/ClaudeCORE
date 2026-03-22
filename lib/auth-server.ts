import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentMember() {
  const session = await getSession();
  if (!session?.user) return null;
  return {
    memberId: session.user.memberId,
    email: session.user.email,
    name: session.user.name,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    status: session.user.status,
    isAdmin: session.user.role === "admin",
    isApproved: session.user.status === "approved" || session.user.role === "admin",
    registrationCompleted: session.user.registrationCompleted ?? false,
  };
}

export async function requireAuth() {
  const member = await getCurrentMember();
  if (!member) redirect("/members");
  return member;
}

export async function requireAdmin() {
  const member = await requireAuth();
  if (!member.isAdmin) redirect("/");
  return member;
}

export async function requireApproved() {
  const member = await requireAuth();
  if (member.status === "new") redirect("/join");
  if (member.status === "pending") redirect("/members/pending");
  if (!member.isApproved) redirect("/members");
  return member;
}
