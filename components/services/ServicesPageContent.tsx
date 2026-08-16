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
  { title: "Scheduling & Managing Cleaning", text: "Upholding the highest standards with Summerhouse housekeepers, gardeners, and maintenance support." },
  { title: "HR Management", text: "Streamlining hiring, training, workplace morale, payroll, and performance supervision." },
  { title: "Staff Training & Supervising", text: "Supervisor-led training programs aimed at boosting productivity and guest satisfaction." },
  { title: "Guest Relations", text: "Exceptional customer service dedicated to providing an enjoyable and memorable stay." },
  { title: "Check-in & Check-out", text: "Delivering a seamless arrival and departure experience to build immediate trust." },
  { title: "Property Care & Inspection", text: "Thorough regular inspections to identify and resolve maintenance issues promptly." },
  { title: "Cost Management", text: "Established partnerships with distributors to minimize costs without sacrificing quality." },
  { title: "Monitoring Villa Supplies", text: "Ensuring sheets, shower amenities, and essentials are fully stocked at all times." },
  { title: "Inventories", text: "Comprehensive tracking of all assets to record and maintain your property investments." },
  { title: "Arranging Extra Services", text: "Airport transfers, private tours, chef services, and massages via trusted providers." }
];

// ── SUB-SERVICES DATA FOR SECTION 2 (Sales & Marketing) ──
const defaultMarketingServices = [
  { title: "Financial Forecasting", text: "Detailing potential revenue and profit projections to help you make informed decisions." },
  { title: "Revenue Strategy", text: "Deploying data-driven strategies to set realistic goals and maximize villa performance." },
  { title: "Property Profile Copywriting", text: "Producing engaging villa descriptions to build trust with potential guests." },
  { title: "Extensive Distribution", text: "Reaching wide demographics across 10+ channels, including direct bookings, OTAs, and agents." },
  { title: "Dedicated Direct Booking Website", text: "Providing a dedicated online platform for your villa to minimize OTA fees and boost revenue." },
  { title: "Data-Driven Online Advertising", text: "Targeted campaigns to expand villa outreach and maximize occupancy rates." },
  { title: "Dynamic Pricing Strategy", text: "Utilizing in-depth market research to optimize nightly rates and meet revenue goals." },
  { title: "SEO Optimization", text: "Maximizing visibility on search algorithms, ensuring your villa attracts maximum traffic." },
  { title: "Prompt Reservation Team", text: "The Summerhouse reservations team guides guests throughout the booking process 24/7." },
  { title: "Comprehensive Reports", text: "Delivering monthly financial reports highlighting revenue, expenditures, and bookings." }
];

// ── SUB-SERVICES DATA FOR SECTION 3 (Project Management) ──
const defaultProjectServices = [
  { title: "Finding the Right Properties", text: "Meticulously inspecting properties for location, rental demand, and profitability." },
  { title: "Notary & Legal Counsel", text: "Ensuring full compliance with local regulations, permits, and short-term rental laws." },
  { title: "Project Assessment & Consultation", text: "Pinpointing necessary renovations to transform properties into high-yield rentals." },
  { title: "Design & Planning Coordination", text: "Integrating innovative design elements that align with your vision and market trends." },
  { title: "Contractor & Vendor Selection", text: "Sourcing and managing trusted contractors to ensure efficiency and reliability." },
  { title: "Material Procurement & Logistics", text: "Efficient logistics to ensure the steady flow of quality, cost-effective materials." },
  { title: "Construction Management & QC", text: "Strict quality control to turn your villa into a premium rental destination." },
  { title: "Furniture, Fixture & Decor Procurement", text: "Transforming the spaces from concept to reality with peak efficiency." },
  { title: "Project Reporting", text: "Tracking timelines, resource allocation, and budget updates for total transparency." }
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
  const management = content?.management;
  const ownerSection = content?.owner_testimonials;
  const finalCta = content?.final_cta;
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
  const ownerHeading = typeof ownerSection?.heading === "string" && ownerSection.heading.trim()
    ? ownerSection.heading
    : "What thoughtful management feels like.";
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
      <section className={styles.heroSection}>
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
              <h3>Watch Video</h3>
              <p>Experience summerhouse management.</p>
            </div>
          </div>

          {/* Left Title */}
          <div className={styles.heroLeftContainer}>
            <h1 className={styles.heroTitle}>
              Bespoke villa<br />
              management in heart<br />
              of the Bali
            </h1>
            <Link href="/contact" className={styles.heroBtnPill}>
              <span>Partner With Us</span>
              <span className={styles.heroBtnArrow}>
                <FiArrowRight />
              </span>
            </Link>
          </div>

          {/* Bottom Right Description */}
          <p className={styles.heroDesc}>
            Discover a new standard of villa management, from bespoke Canggu estates to premium cliffside residences across Bali.
          </p>
        </div>
      </section>

      {/* ── 2. PARTNERSHIP PERKS SECTION ── */}
      {partnership?.is_visible !== false ? <motion.section
        className={styles.perks}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.sectionHeader} variants={fadeUpVariants}>
          <span className={styles.eyebrow}>Why Partner With Us</span>
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
          <motion.div className={styles.specialtyCard} variants={fadeUpVariants}>
            <span className={styles.cardNum}>01</span>
            <h3>Villa Operation</h3>
            <p>Impeccable daily operations, housekeeping, supplies management, and direct hospitality care.</p>
            <a href="#operational-management" className={styles.cardLink}>Explore Details <FiArrowRight /></a>
          </motion.div>
          <motion.div className={styles.specialtyCard} variants={fadeUpVariants}>
            <span className={styles.cardNum}>02</span>
            <h3>Villa Sales & Marketing</h3>
            <p>Dynamic pricing, global distribution, SEO, direct booking systems, and revenue strategy.</p>
            <a href="#sales-marketing" className={styles.cardLink}>Explore Details <FiArrowRight /></a>
          </motion.div>
          <motion.div className={styles.specialtyCard} variants={fadeUpVariants}>
            <span className={styles.cardNum}>03</span>
            <h3>Villa Project & Renovation</h3>
            <p>Meticulous contractor sourcing, design planning, legal counsel, and logistics oversight.</p>
            <a href="#project-management" className={styles.cardLink}>Explore Details <FiArrowRight /></a>
          </motion.div>
        </motion.div>
      </motion.section> : null}

      {/* ── 4. INTERACTIVE SCROLL-LINKED TESTIMONIAL SECTION (real owner testimonials from the CMS; hidden until one is approved) ── */}
      {ownerSection?.is_visible !== false && hasOwnerTestimonials && activeOwner ? (
        <motion.section
          className={styles.ownerTestimonialSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
        >
          <div className={styles.ownerTestimonialHeader}>
            <h2>{ownerHeading}</h2>
            <p>Direct notes from owners whose homes are cared for by the Summerhouse team.</p>
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
      <section className={styles.ownerFormSection}>
        <OwnerTestimonialForm />
      </section>

      {/* ── 5. DETAILED SERVICES Deep-Dive ── */}
      
      {/* SECTION 1: Operational Management */}
      <motion.section 
        id="operational-management" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.pillLabel}>Operations</span>
            <h2>Operational Management</h2>
            <p className={styles.specialtyDescription}>
              “Our operational management services are designed to alleviate the stress and hassle of day-to-day operations of rental property, allowing you to focus on other aspects of your daily life. Our attention to detail and commitment to excellent service will give you peace of mind, knowing that your investment is being well taken care of with efficiency and professionalism.”
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              Contact us for inquiry
            </Link>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.subServicesGrid}>
              {operationalServices.map((service, index) => (
                <div key={index} className={styles.subServiceCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardNum}>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <hr className={styles.divider} />

      {/* SECTION 2: Sales & Marketing and Financial Management */}
      <motion.section 
        id="sales-marketing" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.pillLabel}>Revenue & guest demand</span>
            <h2>Sales, Marketing & Financial Management</h2>
            <p className={styles.specialtyDescription}>
              “Leaving your rental property with vacant dates can be stressful, and marketing it to the right guests at the right time with the right price may take a lot of effort and time. We can help maximize occupancy and ensure a steady income for your rental property through effective sales and marketing strategies. We also offer financial management services for complete transparency on your property’s financial status.”
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              Contact us for inquiry
            </Link>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.subServicesGrid}>
              {marketingServices.map((service, index) => (
                <div key={index} className={styles.subServiceCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardNum}>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <hr className={styles.divider} />

      {/* SECTION 3: Villa Project Management */}
      <motion.section 
        id="project-management" 
        className={styles.deepDiveSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.deepDiveHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.pillLabel}>Project delivery</span>
            <h2>Villa Project Management</h2>
            <p className={styles.specialtyDescription}>
              “Building or renovating a property can be a challenging and time-consuming process. Our project management services will ensure that your project runs smoothly from start to finish. We will oversee all aspects of the project, from sourcing materials and vendors to coordinating construction timelines and managing the budget.”
            </p>
            <Link href="/contact" className={styles.btnOutline}>
              Contact us for inquiry
            </Link>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.subServicesGrid}>
              {projectServices.map((service, index) => (
                <div key={index} className={styles.subServiceCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardNum}>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 6. FAQ SECTION ── */}
      <motion.section 
        className={styles.faq}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUpVariants}
      >
        <div className={styles.faqGrid}>
          <div className={styles.faqLeft}>
            <span className={styles.eyebrow}>Support</span>
            <h2>Frequently Asked Questions</h2>
            <p>Can't find what you are looking for? Reach out to the Summerhouse support team directly.</p>
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
      </motion.section>

      {/* ── 7. BOOK APPOINTMENT CTA ── */}
      {finalCta?.is_visible !== false ? <motion.section
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
