import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ConciergePageContent from "@/components/concierge/ConciergePageContent";
import { getCmsServiceCards } from "@/lib/cms";

export const metadata: Metadata = { title: "Concierge", description: "Thoughtful local support before arrival and throughout your Summerhouse Bali stay.", alternates: { canonical: "/concierge" } };

export default async function ConciergePage(){
  const services = await getCmsServiceCards("concierge");
  return <><Navbar alwaysSolid/><ConciergePageContent cmsServices={services}/><Footer/></>;
}
