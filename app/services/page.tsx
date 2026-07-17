import Navbar from "@/components/common/Navbar";
import ServicesPageContent from "@/components/services/ServicesPageContent";
import Footer from "@/components/common/Footer";
import { getCmsFaqs, getCmsOwnerTestimonials, getCmsServiceCards } from "@/lib/cms";

export const metadata = {
  title: "Villa Management Services | Summerhouse Bali",
  description: "Maximize your Bali property investment. End-to-end property management services including operations, sales, marketing, and project renovation.",
};

export default async function ServicesPage() {
  const [operationalServices, marketingServices, projectServices, faqs, ownerTestimonials] = await Promise.all([
    getCmsServiceCards("operational"),
    getCmsServiceCards("marketing"),
    getCmsServiceCards("project"),
    getCmsFaqs("services"),
    getCmsOwnerTestimonials(),
  ]);

  return (
    <div className="services-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="services-route-main">
        <ServicesPageContent
          operationalServices={operationalServices}
          marketingServices={marketingServices}
          projectServices={projectServices}
          faqs={faqs}
          ownerTestimonials={ownerTestimonials}
        />
      </main>
      <Footer />
    </div>
  );
}
