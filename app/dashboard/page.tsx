import { searchAvailableVillas } from "@/lib/lodgify";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = {
  title: "Overview | Summerhouses Dashboard",
};

export default async function DashboardPage() {
  const villas = await searchAvailableVillas();
  return <DashboardOverview villas={villas} />;
}
