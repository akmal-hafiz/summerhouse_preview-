import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Contact from "@/components/contact/Contact";

export const metadata = {
  title: "Contact",
  description: "Contact the Summerhouses Bali team for private villa guidance, guest support, and thoughtful stay planning.",
};

export default function ContactPage() {
  return (
    <div className="contact-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="contact-route-main">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
