import { getDashboardCatalog } from "@/lib/dashboard-catalog";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = {
  title: "Overview | Summerhouses Dashboard",
};

export default async function DashboardPage() {
  const { villas, status } = await getDashboardCatalog();
  return <DashboardOverview villas={villas} catalogStatus={status} />;
}
