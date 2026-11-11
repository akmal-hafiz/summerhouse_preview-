import { redirect } from "next/navigation";

export const metadata = {
  title: "Create account - Summerhouses Bali",
  description: "Create a Summerhouses account to save villas, plan your stay, and book with a personal concierge.",
};

export default function RegisterPage() {
  redirect("/?auth=register");
}
