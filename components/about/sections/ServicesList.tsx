"use client";

import styles from "./ServicesList.module.css";

/**
 * Editorial services list. First two rows carry a description; the rest are
 * name-only. The right-hand label is a truthful category tag, not a price —
 * these are complimentary concierge services, not paid design packages.
 */
const SERVICES = [
  {
    id: "villa-matching",
    name: "Villa Matching",
    description:
      "We help guests choose homes by mood, area, group size, and the kind of Bali rhythm they want.",
    tag: "Planning",
  },
  {
    id: "arrival-care",
    name: "Arrival Care",
    description:
      "From check-in details to first-day guidance, the stay starts with fewer questions and more ease.",
    tag: "On arrival",
  },
  {
    id: "local-concierge",
    name: "Local Concierge",
    description: "",
    tag: "On the ground",
  },
  {
    id: "long-stay-setup",
    name: "Long-Stay Setup",
    description: "",
    tag: "Extended stays",
  },
];

export default function ServicesList() {
  return (
    <section className={styles.section} aria-label="What we do">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Services</p>
        <div className={styles.list}>
          {SERVICES.map((service) => (
            <div className={styles.row} key={service.id}>
              <div className={styles.left}>
                <span className={styles.marker} aria-hidden="true">
                  *
                </span>
                <div className={styles.rowBody}>
                  <h3 className={styles.name}>{service.name}</h3>
                  {service.description && <p className={styles.desc}>{service.description}</p>}
                </div>
              </div>
              <span className={styles.tag}>{service.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
