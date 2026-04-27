import { redirect } from "next/navigation";

export default function Page() {
  redirect("/careers?tab=interview-experiences");
}
