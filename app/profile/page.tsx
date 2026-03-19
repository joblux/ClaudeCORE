import { requireApproved } from "@/lib/auth-server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const member = await requireApproved();
  return <ProfileClient email={member.email!} />;
}
