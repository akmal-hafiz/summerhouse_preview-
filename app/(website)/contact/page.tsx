import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Contact from "@/components/contact/Contact";
import { getCmsFaqs, getCmsSettings } from "@/lib/cms";
import { GLOBAL_CONTACT_KEYS, resolveGlobalContactSettings } from "@/lib/contact-settings";

export const metadata = {
  title: "Contact",
  description: "Contact the Summerhouses Bali team for private villa guidance, guest support, and thoughtful stay planning.",
};

export default async function ContactPage() {
  const [faqs, rawSettings] = await Promise.all([
    getCmsFaqs("contact"),
    getCmsSettings([...GLOBAL_CONTACT_KEYS, "contact.email"]),
  ]);
  const settings = resolveGlobalContactSettings(rawSettings);

  return (
    <div className="contact-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="contact-route-main">
        <Contact
          faqs={faqs}
          settings={settings}
        />
      </main>
      <Footer />
    </div>
  );
}
