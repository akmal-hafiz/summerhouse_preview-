"use client";

import Image from "next/image";
import Link from "next/link";
import GuestStoriesSection from "@/components/testimonials/GuestStoriesSection";
import type { CmsServiceCard, CmsTestimonial } from "@/lib/cms";
import { conciergeServices } from "@/lib/concierge";
import styles from "./ConciergePageContent.module.css";

export default function ConciergePageContent({
  testimonials,
  cmsServices,
}: {
  testimonials?: CmsTestimonial[] | null;
  cmsServices?: CmsServiceCard[] | null;
}) {
  const services = cmsServices?.length
    ? cmsServices.map((service, index) => ({
        id: service.slug || `cms-${index}`,
        title: service.title,
        summary: service.text,
        image: service.image || conciergeServices[index % conciergeServices.length].image,
        alt: service.alt_text || service.title,
      }))
    : conciergeServices;

  return (
    <main className={styles.page}>
      <section className={styles.catalogue} aria-labelledby="concierge-title">
        <header className={styles.header}>
          <div>
            <h1 id="concierge-title">Thoughtful care<em>throughout your stay</em></h1>
          </div>
          <p>Practical local support, coordinated by the Summerhouse team before arrival and while you are in Bali.</p>
        </header>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <article className={styles.service} key={service.id}>
              <div className={styles.serviceMedia}>
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(min-width:1100px) 31vw, (min-width:720px) 48vw, 100vw"
                  priority={index === 0}
                />
              </div>
              <div className={styles.serviceCopy}>
                <span>{String(index + 1).padStart(2, "0")} /</span>
                <div><h2>{service.title}</h2><p>{service.summary}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <GuestStoriesSection testimonials={testimonials} placement="concierge" />

      <div className={styles.booking}><Link href="/villas">Book Now</Link></div>
    </main>
  );
}
