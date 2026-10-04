import { redirect } from "next/navigation";

// "/" has no screen of its own; send the admin to the invitation list
export default function HomePage() {
  redirect("/doctors/invitations/list");
}