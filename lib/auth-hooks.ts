"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useMember() {
  const { data: session, status, update } = useSession();
  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    memberId: session?.user?.memberId,
    email: session?.user?.email,
    name: session?.user?.name,
    firstName: session?.user?.firstName,
    lastName: session?.user?.lastName,
    image: session?.user?.image,
    role: session?.user?.role,
    status: session?.user?.status,
    isAdmin: session?.user?.role === "admin",
    isApproved: session?.user?.status === "approved" || session?.user?.role === "admin",
    isNew: session?.user?.status === "new",
    isPending: session?.user?.status === "pending",
    refreshSession: update,
  };
}

export function useRequireAuth(redirectTo = "/members") {
  const { isAuthenticated, isLoading } = useMember();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push(redirectTo);
  }, [isLoading, isAuthenticated, redirectTo, router]);
  return { isLoading, isAuthenticated };
}

export function useRequireAdmin() {
  const member = useMember();
  const router = useRouter();
  useEffect(() => {
    if (!member.isLoading && !member.isAdmin) {
      router.push(member.isAuthenticated ? "/" : "/members");
    }
  }, [member.isLoading, member.isAdmin, member.isAuthenticated, router]);
  return member;
}

export function useRequireApproved() {
  const member = useMember();
  const router = useRouter();
  useEffect(() => {
    if (member.isLoading) return;
    if (!member.isAuthenticated) router.push("/members");
    else if (member.isNew) router.push("/join");
    else if (member.isPending) router.push("/members/pending");
  }, [member, router]);
  return member;
}
