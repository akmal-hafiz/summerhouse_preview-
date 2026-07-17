import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Contact from "@/components/contact/Contact";
import { getCmsFaqs, getCmsSetting } from "@/lib/cms";

export const metadata = {
  title: "Contact",
  description: "Contact the Summerhouses Bali team for private villa guidance, guest support, and thoughtful stay planning.",
};

const CONTACT_SETTING_KEYS = {
  email: "contact.email",
  phone: "contact.phone",
  whatsapp: "contact.whatsapp",
  address: "contact.address",
  responseTime: "contact.response_time",
} as const;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export default async function ContactPage() {
  const [faqs, email, phone, whatsapp, address, responseTime] = await Promise.all([
    getCmsFaqs("contact"),
    getCmsSetting<string>(CONTACT_SETTING_KEYS.email),
    getCmsSetting<string>(CONTACT_SETTING_KEYS.phone),
    getCmsSetting<string>(CONTACT_SETTING_KEYS.whatsapp),
    getCmsSetting<string>(CONTACT_SETTING_KEYS.address),
    getCmsSetting<string>(CONTACT_SETTING_KEYS.responseTime),
  ]);

  return (
    <div className="contact-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="contact-route-main">
        <Contact
          faqs={faqs}
          settings={{
            email: asString(email),
            phone: asString(phone),
            whatsapp: asString(whatsapp),
            address: asString(address),
            responseTime: asString(responseTime),
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
