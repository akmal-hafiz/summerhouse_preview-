"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./ServicesPageContent.module.css";
import OwnerTestimonialForm from "./OwnerTestimonialForm";
import ScrollDrivenAccordion from "./ScrollDrivenAccordion";
import ServicesInquiryForm from "./ServicesInquiryForm";
import motionStyles from "@/components/common/EditorialMotion.module.css";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useMotionSettings } from "@/components/providers/MotionPreferenceProvider";
import { useServicesMotion } from "./useServicesMotion";



// Owner testimonials come from the CMS (real submissions moderated by the team).
// Shape used internally by the owner testimonial section.
type OwnerTestimonialView = {
  owner: string;
  role: string;
  villa: string;
  image: string;
  portrait: string | null;
  quote: string;
  metrics: Array<{ label: string; value: string }>;
};

const OWNER_BG_FALLBACK = "/homepage_villa/curated-1-main.webp";

// ── SUB-SERVICES DATA FOR SECTION 1 (Operational) ──
const defaultOperationalServices = [
  { title: "Housekeeping & Property Care", text: "Cleaning schedules, inspections, pool and garden care, and responsive maintenance coordinated to one consistent standard." },
  { title: "People, Training & Staff Management", text: "Hiring, payroll, workplace support, training, scheduling, and performance supervision for the villa team." },
  { title: "Guest Relations, Check-in & Check-out", text: "Thoughtful pre-arrival coordination, welcoming check-ins, in-stay support, and smooth departures." },
  { title: "Supplies & Inventory Management", text: "Linen, amenities, utilities, and property assets tracked and replenished before they become operational issues." },
  { title: "Cost, Vendor & Additional Services", text: "Trusted local vendors, transparent cost control, security coordination, and optional guest services managed through one team." },
];

// ── SUB-SERVICES DATA FOR SECTION 2 (Sales & Marketing) ──
const defaultMarketingServices = [
  { title: "Forecasting & Revenue Strategy", text: "Market-informed projections and commercial goals turn seasonality into a practical plan for occupancy and returns." },
  { title: "Property Positioning & Copywriting", text: "Distinctive photography, storytelling, and listing copy present each villa with a clear point of view." },
  { title: "Distribution & Direct Booking", text: "Coordinated OTA, agent, and direct channels extend reach while reducing avoidable commission costs." },
  { title: "Advertising & Search Visibility", text: "Targeted campaigns, social content, and search optimization help qualified guests discover the property." },
  { title: "Dynamic Pricing & Reservations", text: "Live market signals guide nightly pricing while the reservation team supports guests throughout the booking journey." },
  { title: "Reporting & Financial Transparency", text: "Monthly reporting connects bookings, revenue, operating expenditure, and owner payouts in one understandable view." },
];

// ── SUB-SERVICES DATA FOR SECTION 3 (Project Management) ──
const defaultProjectServices = [
  { title: "Property Finding & Feasibility", text: "Potential sites and existing villas are assessed for location, rental demand, condition, and commercial viability." },
  { title: "Legal Counsel & Project Assessment", text: "Local specialists coordinate ownership structures, permits, compliance, scope, and renovation priorities." },
  { title: "Design & Planning Coordination", text: "Architecture, interiors, landscape, and guest experience are aligned before construction decisions are locked." },
  { title: "Contractor & Vendor Management", text: "Trusted teams are selected, briefed, scheduled, and held to agreed quality and delivery standards." },
  { title: "Procurement & Logistics", text: "Materials, furniture, fixtures, technology, and site logistics are coordinated against budget and programme." },
  { title: "Construction Quality & Project Reporting", text: "Progress, workmanship, cost, risks, and pre-launch preparation remain visible from build through handover." },
];

// ── FAQS DATA ──
const defaultFaqs = [
  {
    question: "How does Summerhouse manage villas they do not own?",
    answer: "Summerhouse Bali acts as an end-to-end property management partner. We represent external owners, taking care of daily operations, marketing, bookings, and guest concierge while delivering comprehensive financial reports and returns directly to the owner."
  },
  {
    question: "What are your management fees?",
    answer: "We offer highly competitive rates for our full-service management, calculated as a percentage of booking revenue. There are no hidden costs, ensuring complete transparency and alignment of incentives."
  },
  {
    question: "Do you build custom websites for each villa?",
    answer: "Yes. In addition to listing on major channels (Airbnb, Booking.com), we build and host a dedicated direct booking website for your property to drive direct sales and minimize third-party commission fees."
  },
  {
    question: "How are financial reports shared with villa owners?",
    answer: "We provide detailed monthly financial reports that capture overall revenue, direct channels performance, operational expenditures, guest feedback summaries, and net payouts."
  }
];

const defaultPartnershipPoints = [
  {
    title: "Hands-on local management",
    description: "A Bali-based team stays close to the property, its people, and everyday operations.",
  },
  {
    title: "Revenue-led decisions",
    description: "Pricing, distribution, and reporting are guided by performance, not guesswork.",
  },
  {
    title: "Design-conscious positioning",
    description: "Every home is presented with a clear point of view that respects its architecture and audience.",
  },
  {
    title: "Guest experience that builds value",
    description: "Thoughtful stays earn stronger reviews, repeat demand, and long-term property value.",
  },
];

type ServiceCardProp = { title: string; text: string };
type FaqProp = { question: string; answer: string };
type OwnerTestimonialProp = {
  owner: string;
  role?: string | null;
  villaName?: string | null;
  quote: string;
  metrics: Array<{ label: string; value: string }>;
  avatar?: string | null;
  villaImage?: string | null;
};

type ServicesPageContentProps = {
  operationalServices?: ServiceCardProp[] | null;
  marketingServices?: ServiceCardProp[] | null;
  projectServices?: ServiceCardProp[] | null;
  faqs?: FaqProp[] | null;
  ownerTestimonials?: OwnerTestimonialProp[] | null;
  content?: Record<string, Record<string, unknown> | null> | null;
};

export default function ServicesPageContent({
  operationalServices: opProp,
  marketingServices: mkProp,
  projectServices: prProp,
  faqs: faqsProp,
  ownerTestimonials: ownerProp,
  content,
}: ServicesPageContentProps = {}) {
  const { reduced } = useMotionSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const ownerQuoteRef = useRef<HTMLDivElement>(null);
  const ownerKeyboardRef = useRef(false);
  useServicesMotion(rootRef);
  const operationalServices = opProp && opProp.length ? opProp : defaultOperationalServices;
  const marketingServices = mkProp && mkProp.length ? mkProp : defaultMarketingServices;
  const projectServices = prProp && prProp.length ? prProp : defaultProjectServices;
  const faqs = faqsProp && faqsProp.length
    ? faqsProp.map((f, i) => ({ id: `cms-faq-${i}`, question: f.question, answer: f.answer }))
    : defaultFaqs;
  const ownerTestimonials: OwnerTestimonialView[] = (ownerProp ?? []).map((t) => ({
    owner: t.owner,
    role: t.role ?? "Villa Owner",
    villa: t.villaName ?? "",
    image: t.villaImage || OWNER_BG_FALLBACK,
    portrait: t.avatar ?? null,
    quote: t.quote,
    metrics: t.metrics ?? [],
  }));
  const hasOwnerTestimonials = ownerTestimonials.length > 0;
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const previousOwner = useRef(activeTestimonial);
  useEffect(() => {
    if (previousOwner.current === activeTestimonial) return;
    previousOwner.current = activeTestimonial;
    if (ownerKeyboardRef.current || reduced) return;
    const animation = ownerQuoteRef.current?.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 200, easing: "cubic-bezier(.23, 1, .32, 1)" });
    return () => animation?.cancel();
  }, [activeTestimonial, reduced]);
  const partnership = content?.partnership;
  const hero = content?.hero;
  const management = content?.management;
  const ownerSection = content?.owner_testimonials;
  const ownerForm = content?.owner_form;
  const operationalSection = content?.operational_services;
  const marketingSection = content?.marketing_services;
  const projectSection = content?.project_services;
  const faqIntro = content?.faq_intro;
  const finalCta = content?.final_cta;
  const heroHeading = typeof hero?.heading === "string" && hero.heading.trim()
    ? hero.heading
    : "Bespoke villa\nmanagement in heart\nof the Bali";
  const heroDescription = typeof hero?.description === "string" && hero.description.trim()
    ? hero.description
    : "Discover a new standard of villa management, from bespoke Canggu estates to premium cliffside residences across Bali.";
  const heroButtonLabel = typeof hero?.button_label === "string" && hero.button_label.trim() ? hero.button_label : "Partner With Us";
  const partnershipTitle = typeof partnership?.title === "string" && partnership.title.trim()
    ? partnership.title
    : "The value of a closer partnership.";
  const cmsPoints = Array.isArray(partnership?.points) ? partnership.points : [];
  const partnershipPoints = cmsPoints.length === 4
    ? cmsPoints.map((point) => {
        const row = point && typeof point === "object" ? point as Record<string, unknown> : {};
        return {
          title: typeof row.title === "string" ? row.title : "",
          description: typeof row.description === "string" ? row.description : "",
        };
      })
    : defaultPartnershipPoints;
  const managementHeading = typeof management?.heading === "string" && management.heading.trim()
    ? management.heading
    : "What we manage.";
  const defaultManagementItems = [
    { title: "Villa Operation", description: "Impeccable daily operations, housekeeping, supplies management, and direct hospitality care.", linkLabel: "Explore Details", href: "#operational-management" },
    { title: "Villa Sales & Marketing", description: "Dynamic pricing, global distribution, SEO, direct booking systems, and revenue strategy.", linkLabel: "Explore Details", href: "#sales-marketing" },
    { title: "Villa Project & Renovation", description: "Meticulous contractor sourcing, design planning, legal counsel, and logistics oversight.", linkLabel: "Explore Details", href: "#project-management" },
  ];
  const cmsManagementItems = Array.isArray(management?.items) ? management.items : [];
  const managementItems = cmsManagementItems.length === 3
    ? cmsManagementItems.map((item, index) => {
        const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
        const fallback = defaultManagementItems[index];
        return {
          title: typeof row.title === "string" && row.title.trim() ? row.title : fallback.title,
          description: typeof row.description === "string" && row.description.trim() ? row.description : fallback.description,
          linkLabel: typeof row.link_label === "string" && row.link_label.trim() ? row.link_label : fallback.linkLabel,
          href: fallback.href,
        };
      })
    : defaultManagementItems;
  const ownerHeading = typeof ownerSection?.heading === "string" && ownerSection.heading.trim()
    ? ownerSection.heading
    : "What thoughtful management feels like.";
  const ownerDescription = typeof ownerSection?.description === "string" && ownerSection.description.trim()
    ? ownerSection.description
    : "Direct notes from owners whose homes are cared for by the Summerhouse team.";
  const ownerFormTitle = typeof ownerForm?.title === "string" && ownerForm.title.trim() ? ownerForm.title : "Is your villa managed by Summerhouse?";
  const ownerFormDescription = typeof ownerForm?.description === "string" && ownerForm.description.trim() ? ownerForm.description : "Share your honest experience as an owner, published after a quick review. Your email stays private.";
  const ownerFormButton = typeof ownerForm?.button_label === "string" && ownerForm.button_label.trim() ? ownerForm.button_label : "Share your experience";
  const ownerFormClose = typeof ownerForm?.close_label === "string" && ownerForm.close_label.trim() ? ownerForm.close_label : "Close";
  const sectionCopy = (section: Record<string, unknown> | null | undefined, key: "heading" | "description" | "button_label", fallback: string) =>
    typeof section?.[key] === "string" && section[key].trim() ? section[key] as string : fallback;
  const resolvedFaqTitle = typeof faqIntro?.title === "string" && faqIntro.title.trim() ? faqIntro.title : "Frequently Asked Questions";
  const faqDescription = typeof faqIntro?.description === "string" && faqIntro.description.trim() ? faqIntro.description : "Can't find what you are looking for? Reach out to the Summerhouse support team directly.";
  const ctaTitle = typeof finalCta?.title === "string" && finalCta.title.trim()
    ? finalCta.title
    : "Good care goes a long way.";
  const ctaDescription = typeof finalCta?.description === "string" && finalCta.description.trim()
    ? finalCta.description
    : "We look after the property, the people in it, and everything in between.";
  const ctaLabel = typeof finalCta?.button_label === "string" && finalCta.button_label.trim()
    ? finalCta.button_label
    : "Partner With Us";

  const handleNextTestimonial = () => {
    if (!hasOwnerTestimonials) return;
    setActiveTestimonial((prev) => (prev + 1) % ownerTestimonials.length);
  };

  const handlePrevTestimonial = () => {
    if (!hasOwnerTestimonials) return;
    setActiveTestimonial((prev) => (prev - 1 + ownerTestimonials.length) % ownerTestimonials.length);
  };

  const activeOwner: OwnerTestimonialView = ownerTestimonials[
    Math.min(activeTestimonial, Math.max(ownerTestimonials.length - 1, 0))
  ] ?? {
    owner: "",
    role: "Villa Owner",
    villa: "",
    image: OWNER_BG_FALLBACK,
    portrait: null,
    quote: "",
    metrics: [],
  };

  const serviceGroups = [
    { id: "operational-management", content: operationalSection, heading: "Operational Management", description: "A Bali-based team coordinates the people, property standards, and everyday details that keep each stay running calmly and consistently.", items: operationalServices, label: "Operational management services" },
    { id: "sales-marketing", content: marketingSection, heading: "Sales, Marketing & Financial Management", description: "Pricing, positioning, distribution, and reporting work as one system to build qualified demand and give owners a transparent view of performance.", items: marketingServices, label: "Sales, marketing and financial management services" },
    { id: "project-management", content: projectSection, heading: "Villa Project Management", description: "From feasibility and legal coordination to design, construction, procurement, and handover, every project stage remains connected and visible.", items: projectServices, label: "Villa project management services" },
  ];
  const overviewImages = [
    { src: "/homepage_villa/curated-1-main.webp", alt: "A prepared poolside lounge at a Summerhouse villa" },
    { src: "/homepage_villa/curated-4-view.webp", alt: "Poolside refreshments prepared for a Summerhouse stay" },
    { src: "/homepage_villa/villaarta.webp", alt: "Architecture and pool at Villa Arta" },
  ];
  const defaultHeading = heroHeading.replace(/\s+/g, " ").trim() === "Bespoke villa management in heart of the Bali";

  return (
    <div className={`${styles.container} ${motionStyles.root}`} ref={rootRef}>
      {hero?.is_visible !== false ? (
        <section id="services-hero" className={styles.hero} aria-labelledby="services-title">
          <h1 id="services-title" aria-label={heroHeading}>
            {defaultHeading ? <span aria-hidden="true">Bespoke villa<br />management<br />in heart<br />of the Bali</span> : heroHeading}
          </h1>
          <div className={styles.heroRight}>
            <figure className={styles.heroFrame}>
              <Image data-services-hero-image src="/homepage_villa/rumahmimosa.webp" alt="The courtyard and pool at a Summerhouse managed villa" fill sizes="(min-width: 1000px) 480px, (min-width: 701px) 44vw, 100vw" priority />
            </figure>
            <p>{heroDescription}</p>
            <InteractiveHoverButton href="/contact" className={styles.primaryLink} arrow={<FiArrowUpRight aria-hidden="true" />}>{heroButtonLabel}</InteractiveHoverButton>
          </div>
        </section>
      ) : null}

      {partnership?.is_visible !== false ? (
        <section id="partnership" className={styles.partnership} aria-labelledby="partnership-title">
          <h2 id="partnership-title">{partnershipTitle}</h2>
          <div className={styles.partnershipList}>
            {partnershipPoints.map((point, index) => (
              <article key={`${point.title}-${index}`} className={styles.partnershipRow} data-motion-rule-host><span data-motion-rule aria-hidden="true" />
                <h3>{point.title}</h3><p>{point.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {management?.is_visible !== false ? (
        <section id="what-we-manage" className={styles.management} aria-labelledby="management-title">
          <h2 id="management-title">{managementHeading}</h2>
          <div className={styles.managementGrid} data-services-overview>
            {managementItems.map((item, index) => (
              <article key={item.href} className={styles.managementItem}>
                <figure className={styles.overviewFrame}>
                  <Image src={overviewImages[index].src} alt={overviewImages[index].alt} fill sizes="(min-width: 701px) 30vw, 100vw" />
                </figure>
                <div className={styles.managementCopy}>
                  <h3>{item.title}</h3><p>{item.description}</p>
                  <a href={item.href} className={styles.textLink} data-motion-link aria-label={`${item.linkLabel}: ${item.title}`}>{item.linkLabel}<FiArrowUpRight aria-hidden="true" /></a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {ownerSection?.is_visible !== false && hasOwnerTestimonials ? (
        <section id="owner-stories" className={styles.owners} aria-labelledby="owner-stories-title">
          <header className={styles.sectionHeader}><h2 id="owner-stories-title">{ownerHeading}</h2><p>{ownerDescription}</p></header>
          <div className={styles.ownerGrid}>
            <figure className={styles.ownerFrame}>
              <Image src={activeOwner.image} alt={activeOwner.villa || "Summerhouse managed villa"} fill sizes="(min-width: 701px) 40vw, 100vw" />
            </figure>
            <div className={styles.ownerCopy}>
              <div ref={ownerQuoteRef} aria-live="polite" aria-atomic="true">
                <blockquote>“{activeOwner.quote}”</blockquote>
                <div className={styles.ownerIdentity}><strong>{activeOwner.owner}</strong><span>{activeOwner.role}</span>{activeOwner.villa ? <span>{activeOwner.villa}</span> : null}</div>
              </div>
              {ownerTestimonials.length > 1 ? <div className={styles.ownerNav}>
                <button data-motion-button="outline" type="button" onClick={event => { ownerKeyboardRef.current = event.detail === 0; handlePrevTestimonial(); }} aria-label="Previous owner testimonial"><FiChevronLeft aria-hidden="true" /></button>
                <span>{activeTestimonial + 1} / {ownerTestimonials.length}</span>
                <button data-motion-button="outline" type="button" onClick={event => { ownerKeyboardRef.current = event.detail === 0; handleNextTestimonial(); }} aria-label="Next owner testimonial"><FiChevronRight aria-hidden="true" /></button>
              </div> : null}
            </div>
          </div>
        </section>
      ) : null}

      {ownerForm?.is_visible !== false ? <section id="owner-submission" className={styles.ownerFormSection}>
        <OwnerTestimonialForm title={ownerFormTitle} description={ownerFormDescription} buttonLabel={ownerFormButton} closeLabel={ownerFormClose} />
      </section> : null}

      {serviceGroups.map(group => group.content?.is_visible !== false ? (
        <section id={group.id} key={group.id} className={styles.serviceSection} aria-labelledby={`${group.id}-title`}>
          <header className={styles.serviceHeader} data-motion-rule-host>{group.id === "operational-management" ? <span data-chapter-spine aria-hidden="true" /> : null}
            <h2 id={`${group.id}-title`}>{sectionCopy(group.content, "heading", group.heading)}</h2>
            <p>{sectionCopy(group.content, "description", group.description)}</p>
            <Link href="/contact" className={styles.textLink} data-motion-link>{sectionCopy(group.content, "button_label", "Contact us for inquiry")}<FiArrowUpRight aria-hidden="true" /></Link>
          </header>
          <ScrollDrivenAccordion items={group.items} label={group.label} />
        </section>
      ) : null)}

      {faqIntro?.is_visible !== false ? (
        <section id="services-faq" className={styles.faq} aria-labelledby="services-faq-title">
          <header><h2 id="services-faq-title">{resolvedFaqTitle}</h2><p>{faqDescription}</p></header>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => <details name="services-faq" className={styles.faqItem} key={index} data-motion-rule-host>
              <summary>{faq.question}<span className={styles.plus} aria-hidden="true" /><span data-motion-rule aria-hidden="true" /></summary><p>{faq.answer}</p>
            </details>)}
          </div>
        </section>
      ) : null}

      {finalCta?.is_visible !== false ? (
        <section id="services-contact" className={styles.contact} aria-labelledby="services-contact-title">
          <Image src="/homepage_villa/villaarta.webp" alt="A Summerhouse villa in Bali" fill sizes="(min-width: 1600px) 1520px, 100vw" className={styles.contactBackground} data-cta-background />
          <div className={styles.contactIntro}><h2 id="services-contact-title">{ctaTitle}</h2><p>{ctaDescription}</p>
            <Link href="/contact?inquiry=property-partnership" className={styles.textLink} data-motion-link>{ctaLabel}<FiArrowRight aria-hidden="true" /></Link>
          </div>
          <ServicesInquiryForm />
        </section>
      ) : null}
    </div>
  );
}
