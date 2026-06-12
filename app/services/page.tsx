import Navbar from "@/components/common/Navbar";
import ServicesPageContent from "@/components/services/ServicesPageContent";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Villa Management Services | Summerhouse Bali",
  description: "Maximize your Bali property investment. End-to-end property management services including operations, sales, marketing, and project renovation.",
};

export default function ServicesPage() {
  return (
    <div className="services-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="services-route-main">
        <ServicesPageContent />
      </main>
      <Footer />
    </div>
  );
}
