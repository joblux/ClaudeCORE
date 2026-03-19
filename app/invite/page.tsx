import { requireApproved } from "@/lib/auth-server";
import InviteClient from "./InviteClient";

export default async function InvitePage() {
  await requireApproved();
  return <InviteClient />;
}
