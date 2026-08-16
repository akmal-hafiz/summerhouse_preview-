import { notFound, permanentRedirect } from "next/navigation";
import { getDestinationBySlug } from "@/lib/destinations";

export const revalidate = 300;

type DestinationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) notFound();

  const location = destination.lodgifyLocation || destination.location;
  permanentRedirect(`/villas?location=${encodeURIComponent(location)}&match=exact`);
}
