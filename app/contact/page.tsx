import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Contact from "@/components/contact/Contact";

export const metadata = {
  title: "Contact | Summerhouse Bali",
  description: "Connect with our team for bookings, inquiries, and more.",
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
