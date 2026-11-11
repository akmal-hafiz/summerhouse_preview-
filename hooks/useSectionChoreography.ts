"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionSettings } from "@/components/providers/MotionPreferenceProvider";

gsap.registerPlugin(ScrollTrigger);
type Page = "services" | "about";

/** Each chapter owns its own trigger, progress range and motion vocabulary. */
export function useSectionChoreography(root: RefObject<HTMLElement | null>, page: Page) {
  const { reduced, ready } = useMotionSettings();
  useEffect(() => {
    const element = root.current;
    if (!element || !ready) return;
    let alive = true;
    let refreshTimer: ReturnType<typeof setTimeout>;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ desktop: "(min-width: 1000px)", mobile: "(max-width: 999px)", reduce: "(prefers-reduced-motion: reduce)" }, match => {
        if (reduced) return;
        const desktop = Boolean(match.conditions?.desktop);
        const distance = desktop ? 1 : .4;
        const palette = getComputedStyle(element);
        const ink = palette.getPropertyValue("--color-text").trim() || palette.color;
        const mutedInk = palette.getPropertyValue("--color-text-muted").trim() || ink;
        const find = (selector: string, within: Element = element) => within.querySelector<HTMLElement>(selector);
        const all = (selector: string, within: Element = element) => Array.from(within.querySelectorAll<HTMLElement>(selector));
        const chapter = (selector: string, name: string, start: string, end: string, scrub = .4) => {
          const section = find(selector);
          if (!section) return null;
          const timeline = gsap.timeline({ id: `${page}-${name}`, defaults: { ease: "none" }, scrollTrigger: {
            id: `${page}-${name}`, trigger: section, start, end: `clamp(${end})`, scrub, invalidateOnRefresh: true,
            onRefresh: trigger => {
              if (process.env.NODE_ENV !== "production") {
                section.dataset.motionStart = String(trigger.start);
                section.dataset.motionEnd = String(trigger.end);
              }
            },
          } });
          section.dataset.motionTimeline = `${page}-${name}`;
          return { section, timeline };
        };
        const trace = (timeline: gsap.core.Timeline, section: Element, origin: string, stagger = .12) => {
          const rules = all("[data-motion-rule]", section);
          if (rules.length) timeline.fromTo(rules, { scaleX: 0, transformOrigin: origin }, { scaleX: 1, duration: 1, stagger }, 0);
        };
        if (page === "services") {
          const hero = find("#services-hero");
          if (hero) {
            const title = find("h1", hero), frame = find("figure", hero), image = find("img", hero);
            const intro = gsap.timeline({ id: "services-hero-intro" });
            if (title) intro.fromTo(title, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8, ease: "power3.out" });
            if (frame) intro.fromTo(frame, { clipPath: "inset(10% 8% 10% 8% round 4px)" }, { clipPath: "inset(0% 0% 0% 0% round 4px)", duration: 1, ease: "power3.out" }, .12);
            const exit = chapter("#services-hero", "hero-depth", "top top", "bottom top", .5);
            if (exit && image) exit.timeline.fromTo(image, { scale: 1.08, yPercent: 0 }, { scale: 1.14, yPercent: -4 * distance, duration: 1 });
          }
          const partnership = chapter("#partnership", "partnership-lines", "top 85%", "bottom 65%", .35);
          if (partnership) {
            trace(partnership.timeline, partnership.section, "left center", .3);
            all("article h3", partnership.section).forEach((title, index) => partnership.timeline.fromTo(title,
              { color: mutedInk }, { color: ink, duration: .5 }, index * .3));
          }
          const management = chapter("#what-we-manage", "management-unfold", "top 90%", "top 18%", .6);
          if (management) {
            all("figure", management.section).forEach((frame, index) => management.timeline.fromTo(frame,
              { rotation: (index % 2 ? 4 : -4) * distance, yPercent: (index === 1 ? 18 : 10) * distance, scale: .9, transformOrigin: "50% 90%" },
              { rotation: 0, yPercent: 0, scale: 1, duration: 1.1 }, index * .2));
          }
          const owners = chapter("#owner-stories", "owners-diptych", "top 85%", "top 25%", .45);
          if (owners) {
            const frame = find("figure", owners.section), quote = find("blockquote", owners.section);
            if (frame) owners.timeline.fromTo(frame, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 });
            if (quote) owners.timeline.fromTo(quote, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8 }, .3);
          }
          const submission = chapter("#owner-submission", "owner-invitation", "top 85%", "top 55%", .25);
          if (submission) trace(submission.timeline, submission.section, "right center");
          const operations = chapter("#operational-management", "operations-spine", "top 85%", "bottom 80%", .35);
          if (operations) {
            trace(operations.timeline, operations.section, "left center", .15);
            const spine = find("[data-chapter-spine]", operations.section);
            if (spine) operations.timeline.fromTo(spine, { scaleY: 0, transformOrigin: "center top" }, { scaleY: 1, duration: 1.4 }, 0);
          }
          const marketing = chapter("#sales-marketing", "marketing-horizontal", "top 85%", "top 30%", .45);
          if (marketing) {
            const title = find("h2", marketing.section);
            if (title) marketing.timeline.fromTo(title, { x: -36 * distance, clipPath: "inset(0% 100% 0% 0%)" }, { x: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.2 });
            trace(marketing.timeline, marketing.section, "right center", .14);
          }
          const project = chapter("#project-management", "project-vertical", "top 88%", "top 28%", .5);
          if (project) {
            const title = find("h2", project.section);
            if (title) project.timeline.fromTo(title, { clipPath: "inset(100% 0% 0% 0%)", y: 18 * distance }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1 });
            all("[data-motion-rule]", project.section).forEach((rule, index) => project.timeline.fromTo(rule,
              { scaleX: .08, transformOrigin: "center" }, { scaleX: 1, duration: .6 }, .1 + index * .15));
          }
          const faq = chapter("#services-faq", "faq-rhythm", "top 82%", "top 32%", .25);
          if (faq) trace(faq.timeline, faq.section, "center", .1);
          const contact = chapter("#services-contact", "contact-backdrop", "top bottom", "bottom top", .65);
          if (contact) {
            const background = find("[data-cta-background]", contact.section);
            if (background) contact.timeline.fromTo(background, { scale: 1.16, yPercent: -4 * distance }, { scale: 1.12, yPercent: 4 * distance, duration: 1 });
          }
        } else {
          const hero = find("#our-story h1");
          if (hero) gsap.fromTo(hero, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .9, ease: "power3.out" });
          const opening = chapter("#our-story", "opening-rule", "top top", "bottom 20%", .4);
          if (opening) trace(opening.timeline, opening.section, "left center");
          const trust = chapter("#trust-recognition", "trust-photo-depth", "top 90%", "bottom 55%", .5);
          if (trust) {
            const frame = find("[data-about-reveal]", trust.section), image = find("img", trust.section);
            if (frame) trust.timeline.fromTo(frame, { rotationY: -9 * distance, transformPerspective: 900, transformOrigin: "right center" }, { rotationY: 0, duration: 1 });
            if (image) trust.timeline.fromTo(image, { scale: 1.14, yPercent: -5 * distance }, { scale: 1, yPercent: 0, duration: 1 }, 0);
          }
          const purpose = chapter("#our-purpose", "purpose-orbit", "top 80%", "bottom 35%", .7);
          if (purpose) {
            const image = find("[data-about-reveal]", purpose.section);
            if (image) purpose.timeline.fromTo(image, { rotation: -4 * distance, y: -20 * distance, x: -10 * distance }, { rotation: 3 * distance, y: 35 * distance, x: 10 * distance, duration: 1 });
          }
          all("#booking-process [data-booking-step]").forEach((step, index) => {
            const stack = find("[data-polaroids]", step);
            if (!stack) return;
            // Each pair settles within its own step, independent of the chapter's height.
            // Keep the photographs visible and leave their individual CSS hover transforms alone.
            gsap.fromTo(stack, { scale: .94, y: 12 * distance }, {
              scale: 1, y: 0, ease: "none",
              scrollTrigger: {
                id: `about-booking-paper-${index + 1}`, trigger: step,
                start: "top 85%", end: "clamp(top 55%)", scrub: .3,
                invalidateOnRefresh: true,
              },
            });
          });
          const faq = chapter("#faq", "faq-separators", "top 85%", "top 40%", .25);
          if (faq) trace(faq.timeline, faq.section, "left center", .13);
          const journal = chapter("#journal", "journal-image-masks", "top 90%", "top 20%", .45);
          if (journal) all("[data-journal-media]", journal.section).forEach((image, index) => journal.timeline.fromTo(image,
            { clipPath: index % 2 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, index * .16));
          const map = chapter("#destination-footprint", "map-introduction", "top 88%", "top 35%", .35);
          if (map) {
            trace(map.timeline, map.section, "right center");
            const title = find("h2", map.section);
            if (title) map.timeline.fromTo(title, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 }, .15);
          }
          const closing = chapter("#about-final-cta", "closing-fold", "top 90%", "top 45%", .45);
          if (closing) {
            const title = find("h2", closing.section);
            if (title) closing.timeline.fromTo(title, { rotationX: 35 * distance, transformPerspective: 1000, transformOrigin: "center bottom" }, { rotationX: 0, duration: 1 });
          }
        }
        return () => { element.querySelectorAll("[data-motion-timeline]").forEach(section => {
          const data = (section as HTMLElement).dataset;
          delete data.motionTimeline; delete data.motionStart; delete data.motionEnd;
        }); };
      });
    }, element);
    const refresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => { if (alive) ScrollTrigger.refresh(); }, 120); };
    const resize = new ResizeObserver(refresh);
    resize.observe(element);
    document.fonts?.ready.then(() => { if (alive) refresh(); });
    element.addEventListener("load", refresh, true);
    return () => { alive = false; clearTimeout(refreshTimer); resize.disconnect(); element.removeEventListener("load", refresh, true); media.revert(); context.revert(); };
  }, [root, page, reduced, ready]);
}
