import { searchAvailableVillas } from "@/lib/lodgify";
import DashboardSaved from "@/components/dashboard/DashboardSaved";

export const metadata = {
  title: "Saved villas | Summerhouses Dashboard",
};

export default async function DashboardSavedPage() {
  const villas = await searchAvailableVillas();
  return <DashboardSaved villas={villas} />;
}
