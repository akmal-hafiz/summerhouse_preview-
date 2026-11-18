import { redirect } from "next/navigation";

export const metadata = {
  title: "Create account",
  description: "Create a Summerhouses account to save villas, plan your stay, and book with a personal concierge.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  redirect("/?auth=register");
}
