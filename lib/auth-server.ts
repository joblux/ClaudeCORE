import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

/**
 * Get the current session in a server component or API route
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get current member data from session (server-side)
 */
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
    memberType: session.user.memberType,
    status: session.user.status,
    isAdmin: session.user.role === "admin",
    isApproved:
      session.user.status === "approved" || session.user.role === "admin",
  };
}

/**
 * Require auth in a server component — redirects if not authenticated
 */
export async function requireAuth() {
  const member = await getCurrentMember();
  if (!member) redirect("/members");
  return member;
}

/**
 * Require admin in a server component
 */
export async function requireAdmin() {
  const member = await requireAuth();
  if (!member.isAdmin) redirect("/dashboard");
  return member;
}

/**
 * Require approved status in a server component
 */
export async function requireApproved() {
  const member = await requireAuth();
  if (member.status === "new") redirect("/members/register");
  if (member.status === "pending") redirect("/members/pending");
  if (!member.isApproved) redirect("/members");
  return member;
}
