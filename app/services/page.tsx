import Navbar from "@/components/common/Navbar";
import Services from "@/components/home/Services";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Guest Services",
  description: "Villa booking guidance, concierge support, and thoughtful Bali stay services by Summerhouses.",
};

export default function ServicesPage() {
  return (
    <div className="services-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="services-route-main">
        <Services />
      </main>
      <Footer />
    </div>
  );
}
