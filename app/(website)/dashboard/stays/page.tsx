import { notFound } from "next/navigation";
import DashboardStays from "@/components/dashboard/DashboardStays";

export const metadata = {
  title: "My stays | Summerhouses Bali",
  description: "Your verified direct Summerhouses reservations.",
};

export default function MyStaysPage() {
  if (process.env.NEXT_PUBLIC_BOOKING_HISTORY_ENABLED !== "true") notFound();
  return <DashboardStays />;
}
