import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ConciergePageContent from "@/components/concierge/ConciergePageContent";
import { getCmsServiceCards, getCmsTestimonials } from "@/lib/cms";

export const metadata: Metadata = { title: "Concierge", description: "Thoughtful local support before arrival and throughout your Summerhouse Bali stay.", alternates: { canonical: "/concierge" } };

export default async function ConciergePage(){
  const [testimonials,services]=await Promise.all([getCmsTestimonials("concierge"),getCmsServiceCards("concierge")]);
  return <><Navbar alwaysSolid/><ConciergePageContent testimonials={testimonials} cmsServices={services}/><Footer/></>;
}
