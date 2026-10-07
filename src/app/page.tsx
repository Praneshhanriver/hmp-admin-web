import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/invitation";

// "/" has no screen of its own; send the admin to the invitation list
export default function HomePage() {
  redirect(ROUTES.list);
}