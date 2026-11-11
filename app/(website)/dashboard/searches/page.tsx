import { getDashboardCatalog } from "@/lib/dashboard-catalog";
import DashboardSearches from "@/components/dashboard/DashboardSearches";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recent searches | Summerhouses Dashboard",
  description: "Your recent villa searches and the villas you viewed.",
};

export default async function RecentSearchesPage() {
  // Only id and name leave the server: viewed-villa rows need a readable title.
  const { villas } = await getDashboardCatalog();
  return <DashboardSearches villaNames={villas.map((villa) => [String(villa.id), villa.name])} />;
}
