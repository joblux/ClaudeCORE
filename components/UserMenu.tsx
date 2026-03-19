"use client";

import { signOut } from "next-auth/react";
import { useMember } from "@/lib/auth-hooks";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
  const { isAuthenticated, isLoading, name, firstName, image, isAdmin, isApproved } =
    useMember();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#e8e6df] animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/members"
        className="text-sm text-[#1a1a1a] hover:text-[#a58e28] transition-colors tracking-wide"
      >
        Sign in
      </Link>
    );
  }

  const displayName = firstName || name?.split(" ")[0] || "Member";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {image ? (
          <img
            src={image}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-[#e8e6df]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white text-xs font-medium flex items-center justify-center">
            {initials}
          </div>
        )}
        <span className="text-sm text-[#1a1a1a] hidden sm:inline">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e8e6df] rounded-sm shadow-lg py-1 z-50">
          {isApproved && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f4f0] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f4f0] transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/invite"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f4f0] transition-colors"
              >
                Invite
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[#a58e28] hover:bg-[#f5f4f0] transition-colors"
            >
              Admin
            </Link>
          )}
          <div className="border-t border-[#e8e6df] my-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-4 py-2 text-sm text-[#777] hover:bg-[#f5f4f0] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
