"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook: Get current member info from session
 */
export function useMember() {
  const { data: session, status, update } = useSession();

  return {
    // Session state
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",

    // Member data
    memberId: session?.user?.memberId,
    email: session?.user?.email,
    name: session?.user?.name,
    firstName: session?.user?.firstName,
    lastName: session?.user?.lastName,
    image: session?.user?.image,

    // Role & status
    role: session?.user?.role,
    memberType: session?.user?.memberType,
    status: session?.user?.status,

    // Computed checks
    isAdmin: session?.user?.role === "admin",
    isApproved: session?.user?.status === "approved" || session?.user?.role === "admin",
    isNew: session?.user?.status === "new",
    isPending: session?.user?.status === "pending",
    isCandidate: session?.user?.memberType === "candidate",
    isEmployer: session?.user?.memberType === "employer",
    isInfluencer: session?.user?.memberType === "influencer",

    // Refresh session (e.g., after approval)
    refreshSession: update,
  };
}

/**
 * Hook: Require authentication — redirect to /members if not signed in
 */
export function useRequireAuth(redirectTo = "/members") {
  const { isAuthenticated, isLoading } = useMember();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  return { isLoading, isAuthenticated };
}

/**
 * Hook: Require admin role — redirect to /dashboard if not admin
 */
export function useRequireAdmin() {
  const member = useMember();
  const router = useRouter();

  useEffect(() => {
    if (!member.isLoading && !member.isAdmin) {
      router.push(member.isAuthenticated ? "/dashboard" : "/members");
    }
  }, [member.isLoading, member.isAdmin, member.isAuthenticated, router]);

  return member;
}

/**
 * Hook: Require approved status — redirect to appropriate page
 */
export function useRequireApproved() {
  const member = useMember();
  const router = useRouter();

  useEffect(() => {
    if (member.isLoading) return;

    if (!member.isAuthenticated) {
      router.push("/members");
    } else if (member.isNew) {
      router.push("/members/register");
    } else if (member.isPending) {
      router.push("/members/pending");
    }
  }, [member, router]);

  return member;
}
