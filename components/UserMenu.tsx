"use client";

import { signOut } from "next-auth/react";
import { useMember } from "@/lib/auth-hooks";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
  const { isAuthenticated, isLoading, name, firstName, image, isApproved } =
    useMember();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div className="w-8 h-8 rounded-full bg-[#333] animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/join"
        className="text-[13px] text-[#888] hover:text-white transition-colors"
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
            className="w-8 h-8 rounded-full object-cover border border-[#333]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#333] text-[#a58e28] text-xs font-medium flex items-center justify-center border border-[#444]">
            {initials}
          </div>
        )}
        <span className="text-[13px] text-[#ccc] hidden sm:inline">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#222] border border-[#333] rounded-[4px] shadow-lg py-1 z-50">
          {isApproved && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/invite"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                Invite
              </Link>
            </>
          )}
          <div className="border-t border-[#333] my-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-4 py-2 text-[13px] text-[#888] hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
