import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Contact from "@/components/contact/Contact";

export const metadata = {
  title: "Contact | Summerhouse Bali",
  description: "Connect with our team for bookings, inquiries, and more.",
};

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden bg-[#FAFAF9]">
      <Navbar alwaysSolid={true} />
      <main className="flex-1 w-full">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
