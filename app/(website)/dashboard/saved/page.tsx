import { getDashboardCatalog } from "@/lib/dashboard-catalog";
import DashboardSaved from "@/components/dashboard/DashboardSaved";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved villas | Summerhouses Dashboard",
};

export default async function DashboardSavedPage() {
  const { villas, status } = await getDashboardCatalog();
  return <DashboardSaved villas={villas} catalogStatus={status} />;
}
