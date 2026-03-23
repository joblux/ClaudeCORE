"use client";

import { SessionProvider } from "next-auth/react";
import InactivityGuard from "./InactivityGuard";
import FormRestoreHandler from "./FormRestoreHandler";

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <InactivityGuard>{children}</InactivityGuard>
      <FormRestoreHandler />
    </SessionProvider>
  );
}
