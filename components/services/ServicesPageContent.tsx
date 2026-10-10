"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowRight, 
  FiChevronDown, 
  FiChevronLeft, 
  FiChevronRight,
  FiHelpCircle,
  FiPlay,
  FiX
} from "react-icons/fi";
import styles from "./ServicesPageContent.module.css";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import OwnerTestimonialForm from "./OwnerTestimonialForm";
import ScrollDrivenAccordion from "./ScrollDrivenAccordion";



// Owner testimonials come from the CMS (real submissions moderated by the team).
// Shape used internally by the scroll-linked testimonial section.
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

// ── ANIMATION VARIANTS ──
const fadeUpVariants: any = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
  const heroVideoTitle = typeof hero?.video_title === "string" && hero.video_title.trim() ? hero.video_title : "Watch Video";
  const heroVideoDescription = typeof hero?.video_description === "string" && hero.video_description.trim() ? hero.video_description : "Experience summerhouse management.";
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

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className={styles.container}>
      {/* ── 0. HERO SECTION ── */}
      {hero?.is_visible !== false ? <section id="services-hero" className={styles.heroSection}>
        <video
          src="/video/herosection_summerhouse.mp4"
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroBgVideo}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {/* Top Floating Card (Watch Video) */}
          <div className={styles.heroFloatingCard} onClick={() => setIsVideoModalOpen(true)}>
            <div className={styles.heroPlayBtn}>
              <FiPlay fill="var(--color-text)" />
            </div>
            <div className={styles.heroCardText}>
              <h3>{heroVideoTitle}</h3>
              <p>{heroVideoDescription}</p>
            </div>
          </div>

          {/* Left Title */}
          <div className={styles.heroLeftContainer}>
            <h1 className={styles.heroTitle}>
              {heroHeading.split("\n").map((line, index, lines) => (
                <span key={`${line}-${index}`}>{line}{index < lines.length - 1 ? <br /> : null}</span>
              ))}
            </h1>
            <Link href="/contact" className={styles.heroBtnPill}>
              <span>{heroButtonLabel}</span>
              <span className={styles.heroBtnArrow}>
                <FiArrowRight />
              </span>
            </Link>
          </div>

          {/* Bottom Right Description */}
          <p className={styles.heroDesc}>
            {heroDescription}
          </p>
        </div>
      </section> : null}

      {/* ── 2. PARTNERSHIP PERKS SECTION ── */}
      {partnership?.is_visible !== false ? <motion.section
        id="partnership"
        className={styles.perks}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.sectionHeader} variants={fadeUpVariants}>
          <h2 className={styles.sectionTitle}>{partnershipTitle}</h2>
        </motion.div>
        <motion.div className={styles.perksGrid} variants={staggerContainer}>
          {partnershipPoints.map((point, index) => (
            <motion.article className={styles.perkCard} variants={fadeUpVariants} key={point.title}>
              <span className={styles.perkNumber}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section> : null}

      {/* ── 3. SPECIALTIES SPLIT ── */}
      {management?.is_visible !== false ? <motion.section
        id="what-we-manage"
        className={styles.specialties}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.specialtiesHeader} variants={fadeUpVariants}>
          <h2>{managementHeading}</h2>
        </motion.div>
        <motion.div className={styles.specialtiesGrid} variants={staggerContainer}>
          {managementItems.map((item, index) => (
            <motion.div className={styles.specialtyCard} variants={fadeUpVariants} key={item.href}>
              <span className={styles.cardNum}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.href} className={styles.cardLink}>{item.linkLabel} <FiArrowRight /></a>
            </motion.div>
          ))}
        </motion.div>
      </motion.section> : null}

      {/* ── 4. INTERACTIVE SCROLL-LINKED TESTIMONIAL SECTION (real owner testimonials from the CMS; hidden until one is approved) ── */}
      {ownerSection?.is_visible !== false && hasOwnerTestimonials && activeOwner ? (
        <motion.section
          id="owner-stories"
          className={styles.ownerTestimonialSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
        >
          <div className={styles.ownerTestimonialHeader}>
            <h2>{ownerHeading}</h2>
            <p>{ownerDescription}</p>
          </div>
          <div className={styles.ownerTestimonialGrid}>
            <div className={styles.ownerTestimonialMedia}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`owner-image-${activeTestimonial}`}
                  className={styles.ownerTestimonialImageLayer}
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={activeOwner.image}
                    alt={activeOwner.villa || "Summerhouse managed villa"}
                    fill
                    sizes="(min-width: 900px) 48vw, 100vw"
                    className={styles.ownerTestimonialImage}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className={styles.ownerTestimonialCopy}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`owner-copy-${activeTestimonial}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeOwner.villa ? <span className={styles.ownerVillaLabel}>{activeOwner.villa}</span> : null}
                  <blockquote>&ldquo;{activeOwner.quote}&rdquo;</blockquote>
                  <div className={styles.ownerIdentity}>
                    <strong>{activeOwner.owner}</strong>
                    <span>{activeOwner.role}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              {ownerTestimonials.length > 1 ? (
                <div className={styles.ownerTestimonialNav}>
                  <button type="button" onClick={handlePrevTestimonial} aria-label="Previous owner testimonial"><FiChevronLeft /></button>
                  <span>{String(activeTestimonial + 1).padStart(2, "0")} / {String(ownerTestimonials.length).padStart(2, "0")}</span>
                  <button type="button" onClick={handleNextTestimonial} aria-label="Next owner testimonial"><FiChevronRight /></button>
                </div>
              ) : null}
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* Owner testimonial submission stays available so the first real story can arrive. */}
      {ownerForm?.is_visible !== false ? <section id="owner-submission" className={styles.ownerFormSection}>
        <OwnerTestimonialForm title={ownerFormTitle} description={ownerFormDescription} buttonLabel={ownerFormButton} closeLabel={ownerFormClose} />
      </section> : null}

      {/* ── 5. DETAILED SERVICES Deep-Dive ── */}
      
      {/* SECTION 1: Operational Management */}
      {operationalSection?.is_visible !== false ? <motion.section
        id="operational-management" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <h2>{sectionCopy(operationalSection, "heading", "Operational Management")}</h2>
            <p className={styles.specialtyDescription}>
              {sectionCopy(operationalSection, "description", "A Bali-based team coordinates the people, property standards, and everyday details that keep each stay running calmly and consistently.")}
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              {sectionCopy(operationalSection, "button_label", "Contact us for inquiry")}
            </Link>
          </div>
          <div className={styles.headerRight}>
            <ScrollDrivenAccordion items={operationalServices} label="Operational management services" />
          </div>
        </div>
      </motion.section> : null}

      {operationalSection?.is_visible !== false && marketingSection?.is_visible !== false ? <hr className={styles.divider} /> : null}

      {/* SECTION 2: Sales & Marketing and Financial Management */}
      {marketingSection?.is_visible !== false ? <motion.section
        id="sales-marketing" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <h2>{sectionCopy(marketingSection, "heading", "Sales, Marketing & Financial Management")}</h2>
            <p className={styles.specialtyDescription}>
              {sectionCopy(marketingSection, "description", "Pricing, positioning, distribution, and reporting work as one system to build qualified demand and give owners a transparent view of performance.")}
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              {sectionCopy(marketingSection, "button_label", "Contact us for inquiry")}
            </Link>
          </div>
          <div className={styles.headerRight}>
            <ScrollDrivenAccordion items={marketingServices} label="Sales, marketing and financial management services" />
          </div>
        </div>
      </motion.section> : null}

      {marketingSection?.is_visible !== false && projectSection?.is_visible !== false ? <hr className={styles.divider} /> : null}

      {/* SECTION 3: Villa Project Management */}
      {projectSection?.is_visible !== false ? <motion.section
        id="project-management" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <h2>{sectionCopy(projectSection, "heading", "Villa Project Management")}</h2>
            <p className={styles.specialtyDescription}>
              {sectionCopy(projectSection, "description", "From feasibility and legal coordination to design, construction, procurement, and handover, every project stage remains connected and visible.")}
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              {sectionCopy(projectSection, "button_label", "Contact us for inquiry")}
            </Link>
          </div>
          <div className={styles.headerRight}>
            <ScrollDrivenAccordion items={projectServices} label="Villa project management services" />
          </div>
        </div>
      </motion.section> : null}

      {/* ── 6. FAQ SECTION ── */}
      {faqIntro?.is_visible !== false ? <motion.section
        id="services-faq"
        className={styles.faq}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.faqGrid}>
          <div className={styles.faqLeft}>
            <h2>{resolvedFaqTitle}</h2>
            <p>{faqDescription}</p>
          </div>
          <div className={styles.faqRight}>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <div key={index} className={`${styles.faqItem} ${activeFaq === index ? styles.active : ""}`}>
                  <button onClick={() => toggleFaq(index)} className={styles.faqQuestion}>
                    <span>{faq.question}</span>
                    <FiChevronDown className={styles.faqIcon} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={styles.faqAnswer}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section> : null}

      {/* ── 7. BOOK APPOINTMENT CTA ── */}
      {finalCta?.is_visible !== false ? <motion.section
        id="services-contact"
        className={styles.bottomCta}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <Image 
          src="/homepage_villa/curated-4-view.webp" 
          alt="Beautiful Bali Villa Terrace" 
          fill
          sizes="100vw"
          className={styles.ctaBgImage}
        />
        <div className={styles.ctaOverlay} />
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>{ctaTitle}</h2>
          <p className={styles.ctaDescription}>{ctaDescription}</p>
          <InteractiveHoverButton href="/contact?inquiry=property-partnership" className={`${styles.btnGlassLarge} ihb-fill-dark`} arrow={null}>
            <span className={styles.btnGlassText}>{ctaLabel}</span>
            <span className={styles.btnGlassArrow}>
              <FiArrowRight />
            </span>
          </InteractiveHoverButton>
        </div>
      </motion.section> : null}

      {/* ── VIDEO LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            className={styles.videoModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              className={styles.videoModalContent}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className={styles.videoModalClose} 
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close video"
              >
                <FiX />
              </button>
              <video
                src="/video/herosection_summerhouse.mp4"
                controls
                autoPlay
                className={styles.videoModalElement}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
