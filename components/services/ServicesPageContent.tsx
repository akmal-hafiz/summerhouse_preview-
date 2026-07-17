"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { 
  FiArrowRight, 
  FiCheck, 
  FiChevronDown, 
  FiChevronUp,
  FiLayers, 
  FiTrendingUp, 
  FiCpu, 
  FiActivity, 
  FiShield, 
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

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

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
};

export default function ServicesPageContent({
  operationalServices: opProp,
  marketingServices: mkProp,
  projectServices: prProp,
  faqs: faqsProp,
  ownerTestimonials: ownerProp,
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

  // Scroll target for the text separation and card fade-in effect
  const zoomSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawScrollYProgress } = useScroll({
    target: hasOwnerTestimonials ? zoomSectionRef : undefined,
    offset: ["start start", "end end"]
  });

  // Smooth out raw scroll position using useSpring to filter out scroll wheel steps
  const scrollYProgress = useSpring(rawScrollYProgress, {
    stiffness: 75,
    damping: 22,
    mass: 0.35,
    restDelta: 0.001
  });

  // Explicitly translate text to push them completely off-screen
  const textLeftX = useTransform(scrollYProgress, [0.0, 0.35], ["0vw", "-58vw"], { clamp: true });
  const textRightX = useTransform(scrollYProgress, [0.0, 0.35], ["0vw", "58vw"], { clamp: true });
  
  // Scale and opacity transformations for 3D zoom-out fly-through text effect
  const textScale = useTransform(scrollYProgress, [0.0, 0.35], [1.0, 1.15], { clamp: true });
  const textOpacity = useTransform(scrollYProgress, [0.0, 0.35], [1.0, 0.0], { clamp: true });

  // Background scale and opacity for parallax background villa photos
  const bgScale = useTransform(scrollYProgress, [0.0, 0.4], [1.0, 1.06], { clamp: true });
  const bgOpacity = useTransform(scrollYProgress, [0.0, 0.3], [0.15, 1.0], { clamp: true });

  // Testimonial card entrance and scale animations (remains visible until section end)
  const cardOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1], { clamp: true });
  const cardY = useTransform(scrollYProgress, [0.25, 0.45], [50, 0], { clamp: true });
  const cardScale = useTransform(scrollYProgress, [0.25, 0.45], [0.95, 1.0], { clamp: true });
  const cardPointerEvents = useTransform(scrollYProgress, (value) => value >= 0.25 ? "auto" : "none");

  const handleNextTestimonial = () => {
    if (!hasOwnerTestimonials) return;
    setActiveTestimonial((prev) => (prev + 1) % ownerTestimonials.length);
  };

  const handlePrevTestimonial = () => {
    if (!hasOwnerTestimonials) return;
    setActiveTestimonial((prev) => (prev - 1 + ownerTestimonials.length) % ownerTestimonials.length);
  };

  const activeOwner = hasOwnerTestimonials
    ? ownerTestimonials[Math.min(activeTestimonial, ownerTestimonials.length - 1)]
    : null;

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
      <motion.section 
        className={styles.perks}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.sectionHeader} variants={fadeUpVariants}>
          <span className={styles.eyebrow}>Why Partner With Us</span>
          <h2 className={styles.sectionTitle}>The perks of partnering with summerhouse</h2>
        </motion.div>
        <motion.div className={styles.perksGrid} variants={staggerContainer}>
          <motion.div className={styles.perkCard} variants={fadeUpVariants}>
            <div className={styles.perkIconWrapper}>
              <FiShield className={styles.perkIcon} />
            </div>
            <h3>Hands-On Expert</h3>
            <p>The Summerhouse team brings experience across the full rental property cycle.</p>
          </motion.div>
          <motion.div className={styles.perkCard} variants={fadeUpVariants}>
            <div className={styles.perkIconWrapper}>
              <FiCpu className={styles.perkIcon} />
            </div>
            <h3>Minimal Fees</h3>
            <p>We offer competitive rates for our full-service management, with no hidden costs, making sure you get the best value.</p>
          </motion.div>
          <motion.div className={styles.perkCard} variants={fadeUpVariants}>
            <div className={styles.perkIconWrapper}>
              <FiTrendingUp className={styles.perkIcon} />
            </div>
            <h3>Maximizing ROI</h3>
            <p>We help to make sure that your property investment performs to its maximum potential by utilizing our proven strategies.</p>
          </motion.div>
          <motion.div className={styles.perkCard} variants={fadeUpVariants}>
            <div className={styles.perkIconWrapper}>
              <FiLayers className={styles.perkIcon} />
            </div>
            <h3>Transparency</h3>
            <p>Providing you with detailed financial reports, ensuring you are always informed about every aspect of your rental property.</p>
          </motion.div>
          <motion.div className={styles.perkCard} variants={fadeUpVariants}>
            <div className={styles.perkIconWrapper}>
              <FiActivity className={styles.perkIcon} />
            </div>
            <h3>Hassle-Free</h3>
            <p>We take care of every detail, freeing you up from the hassle of dealing with the everyday operations of your rental property.</p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── 3. SPECIALTIES SPLIT ── */}
      <motion.section 
        className={styles.specialties}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.specialtiesHeader} variants={fadeUpVariants}>
          <span className={styles.eyebrow}>Our Specialties</span>
          <h2>Our professional service is divided into 3 different specialties</h2>
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
      </motion.section>

      {/* ── 4. INTERACTIVE SCROLL-LINKED TESTIMONIAL SECTION (real owner testimonials from the CMS; hidden until one is approved) ── */}
      {hasOwnerTestimonials && activeOwner ? (
        <section ref={zoomSectionRef} className={styles.interactiveZoomSection}>
          <div className={styles.stickyZoomContainer}>

            {/* Villa Background Image (fades on active testimonial change, scales on scroll) */}
            <div className={styles.stickyBgContainer}>
              {ownerTestimonials.map((item, idx) => (
                <motion.div
                  key={`${item.owner}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: idx === activeTestimonial ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <motion.div
                    style={{ scale: bgScale, opacity: bgOpacity }}
                    className={styles.bgImageWrapper}
                  >
                    <Image
                      src={item.image}
                      alt={item.villa || "Summerhouse managed villa"}
                      fill
                      priority={idx === 0}
                      sizes="100vw"
                      className={styles.stickyBgImage}
                    />
                    <div className={styles.stickyBgOverlay} />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Scroll Zoom Text Headline */}
            <div className={styles.zoomHeadline}>
              <motion.span style={{ x: textLeftX, scale: textScale, opacity: textOpacity }} className={styles.wordLeft}>
                Better
              </motion.span>

              {/* Transparent spacer that matches the gap between text */}
              <div className={styles.imageSpacer} />

              <motion.span style={{ x: textRightX, scale: textScale, opacity: textOpacity }} className={styles.wordRight}>
                Managed
              </motion.span>
            </div>

            {/* Testimonial Card Centering Wrapper (Resolves absolute positioning stretch bug on iOS devices) */}
            <div className={styles.testimonialCardCenteringWrapper}>
              <motion.div
                style={{ opacity: cardOpacity, y: cardY, scale: cardScale, pointerEvents: cardPointerEvents }}
                className={styles.testimonialCardWrapper}
              >
                <div className={styles.testimonialContentArea}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTestimonial}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {activeOwner.villa ? (
                        <div className={styles.testimonialVillaTag}>
                          <span>{activeOwner.villa}</span>
                        </div>
                      ) : null}

                      <blockquote className={styles.testimonialQuoteText}>
                        &ldquo;{activeOwner.quote}&rdquo;
                      </blockquote>

                      {activeOwner.metrics.length > 0 ? (
                        <div className={styles.ownerMetricsGrid}>
                          {activeOwner.metrics.map((metric, midx) => (
                            <div key={midx} className={styles.ownerMetricItem}>
                              <strong>{metric.value}</strong>
                              <span>{metric.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className={styles.testimonialAuthorRow}>
                        <div className={styles.authorAvatarWrapper}>
                          {activeOwner.portrait ? (
                            <Image
                              src={activeOwner.portrait}
                              alt={activeOwner.owner}
                              fill
                              sizes="48px"
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <div className={styles.authorAvatarFallback} aria-hidden="true">
                              {getInitials(activeOwner.owner) || activeOwner.owner.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className={styles.authorMeta}>
                          <strong className={styles.authorName}>{activeOwner.owner}</strong>
                          <span className={styles.authorLocation}>{activeOwner.role}</span>
                          {activeOwner.villa ? (
                            <span className={styles.authorVilla}>Owner of {activeOwner.villa}</span>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Arrows on the right side of the card */}
                {ownerTestimonials.length > 1 ? (
                  <div className={styles.testimonialNavCtrls}>
                    <button
                      type="button"
                      onClick={handlePrevTestimonial}
                      className={styles.testimonialNavArrow}
                      aria-label="Previous testimonial"
                    >
                      <FiChevronUp className={styles.navIconDesktop} />
                      <FiChevronLeft className={styles.navIconMobile} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextTestimonial}
                      className={styles.testimonialNavArrow}
                      aria-label="Next testimonial"
                    >
                      <FiChevronDown className={styles.navIconDesktop} />
                      <FiChevronRight className={styles.navIconMobile} />
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </div>

          </div>
        </section>
      ) : null}

      {/* Owner testimonial submission — always available so the first real story can arrive */}
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
      <motion.section 
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
          <span className={styles.ctaEyebrow}>Villa owner support</span>
          <h2 className={styles.ctaTitle}>Start a considered conversation</h2>
          <p className={styles.ctaDescription}>
            We are happy to speak with you about how we can assist you in creating a successful and fulfilling rental villa business through our services.
          </p>
          <InteractiveHoverButton href="/contact" className={`${styles.btnGlassLarge} ihb-fill-dark`} arrow={null}>
            <span className={styles.btnGlassText}>Contact the team</span>
            <span className={styles.btnGlassArrow}>
              <FiArrowRight />
            </span>
          </InteractiveHoverButton>
        </div>
      </motion.section>

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
