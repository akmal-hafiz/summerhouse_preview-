"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Magnetic from '@/components/common/Magnetic';

// Character-by-character reveal component
const CharacterReveal = ({ text, className }: { text: string, className?: string }) => {
    const characters = text.split("");
    return (
        <span className={className}>
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                        duration: 0.6, 
                        delay: index * 0.03, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    style={{ display: 'inline-block', whiteSpace: char === " " ? "pre" : "normal" }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
};

const managementServicesData = [
  { 
    title: "Villa Maintenance", 
    videoUrl: "https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4",
    briefs: [
      { id: "01", title: "Preventive Care", text: "Routine inspections that catch issues before they become costs. We treat your structure like our own." },
      { id: "02", title: "Pristine Standards", text: "Gardens, pools, and technical systems maintained to peak aesthetic and functional performance." },
      { id: "03", title: "Asset Longevity", text: "Quality repairs and premium materials ensure your property's value grows over time." }
    ]
  },
  { 
    title: "Staff Training", 
    videoUrl: "https://videos.pexels.com/video-files/6606013/6606013-uhd_2560_1440_25fps.mp4",
    briefs: [
      { id: "01", title: "Service Etiquette", text: "Training local teams in the art of subtle, high-end hospitality that anticipates guest needs." },
      { id: "02", title: "Global Standards", text: "Rigorous housekeeping protocols and maintenance checks to ensure international quality." },
      { id: "03", title: "Communication", text: "Fluency in service and hospitality English to ensure guests feel understood and cared for." }
    ]
  },
  { 
    title: "Financial Optimization", 
    videoUrl: "https://videos.pexels.com/video-files/3195442/3195442-uhd_2560_1440_25fps.mp4",
    briefs: [
      { id: "01", title: "Yield Management", text: "Strategic dynamic pricing that reacts to Bali's demand cycles in real-time for maximum occupancy." },
      { id: "02", title: "Absolute Transparency", text: "Detailed monthly financial reporting and cost management you can access from anywhere." },
      { id: "03", title: "ROI Performance", text: "Focused on high-value bookings that respect your property while maximizing your revenue." }
    ]
  },
  { 
    title: "Guest Experience", 
    videoUrl: "https://videos.pexels.com/video-files/4919736/4919736-uhd_2560_1440_25fps.mp4",
    briefs: [
      { id: "01", title: "Seamless Arrivals", text: "From airport transfers to personalized welcomes, every guest journey starts perfectly." },
      { id: "02", title: "24/7 Concierge", text: "A dedicated team handling every request, from private chefs to specialized island tours." },
      { id: "03", title: "Review Leadership", text: "Proactive guest relation management that consistently secures 5-star ratings and repeat stays." }
    ]
  }
];

const testimonials = [
  {
    id: 1,
    name: "Martin Radowski",
    quote: "“Summerhouse turned my empty villa into a fully booked asset.”",
    text: "I didn't have to do a thing. Bookings came in, guests were handled, and the transfers arrived on time. It's the kind of partnership I didn't know I needed.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Daniel Blaned",
    quote: "“Occupancy went from 40% to 85% in six months.”",
    text: "The team handled everything — pricing, guest relations, maintenance. I just received the transfers. I finally feel like my property is working for me, not the other way around.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Olivia Rodru",
    quote: "“I was skeptical at first. Now I'm opening a second property with them.”",
    text: "What won me over wasn't the pitch — it was the execution. Transparent reporting, proactive communication, and a team that genuinely cares about the property.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Jane Hiness",
    quote: "“They treat my villa like it's their own.”",
    text: "That peace of mind is worth more than the numbers — though the numbers are excellent too. My villa has never looked better, and neither has my annual return.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function Services() {
  const [activeId, setActiveId] = useState(1);
  const activeTestimonial = testimonials.find(t => t.id === activeId) || testimonials[0];

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({
      target: parallaxRef,
      offset: ["start end", "end start"]
  });

  // Subtle Parallax Dampening for Desktop
  const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
  });

  const yParallax = useTransform(smoothProgress, [0, 1], ["-15%", "15%"]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleVideoEnd = () => {
    setActiveVideoIndex((prev) => (prev + 1) % managementServicesData.length);
    setProgress(0);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = managementServicesData[activeVideoIndex].videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
    }
  }, [activeVideoIndex]);

  return (
    <div className="w-full bg-[#FAFAF9] h-[2530px] lg:h-[2600px] flex flex-col overflow-x-hidden pt-[120px] lg:pt-[160px]">

      {/* ============================================== */}
      {/* 1. HERO / INTRO SECTION                        */}
      {/* ============================================== */}
      <section className="w-full relative lg:right-[-70px] lg:bottom-[-180px] bottom-[-180px]  px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto flex flex-col items-center mb-16 lg:mb-24">
        <motion.h1
          className="text-[25px] md:text-6xl lg:text-[72px] leading-[1.8] lg:leading-[1.7] text-[#446B4A] mb-4 lg:mb-8 tracking-tight font-medium text-center"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          <CharacterReveal text="Your villa. Our obsession." />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-[#5a5651] relative left-[3px] lg:left-0 bottom-[-6px] lg:bottom-0 text-[11px] md:text-[16px] lg:text-[17px] leading-[1.7] lg:leading-[1.8] font-light max-w-[800px] text-center"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          You built something beautiful. Let us make sure the world knows it — and that it earns exactly what it deserves.
        </motion.p>
      </section>

      {/* ============================================== */}
      {/* 2. STEWARDSHIP & BRIEFING GRID                 */}
      {/* ============================================== */}
      <section className="w-full px-6 md:px-12 relative right-[-60px] top-[290px] lg:px-24 max-w-[1400px] mx-auto mb-32 lg:mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left: Video Area */}
          <div className="lg:col-span-7 relative left-[-60px] lg:left-0 top-[-40px] lg:top-0 flex flex-col">
            {/* Top Navigation Bar */}
            <div className="w-full bg-[#FAFAF9] h-[50px] lg:h-[70px] flex items-center justify-between px-2 md:px-4 z-20 shadow-sm border border-[#1a1a19]/5 rounded-t-[12px]">
              <div className="w-full flex items-center justify-between h-full">
                {managementServicesData.map((service, index) => (
                  <motion.div
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer h-full relative group"
                    onClick={() => { setActiveVideoIndex(index); setProgress(0); }}
                  >
                    <span className={`text-[9px] md:text-[11px] lg:text-[12px] tracking-wide transition-all text-center ${activeVideoIndex === index ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'}`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                      {service.title}
                    </span>
                    {/* Progress Bar Line */}
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#1a1a19] transition-all duration-75"
                        style={{ width: activeVideoIndex === index ? `${progress}%` : activeVideoIndex > index ? '100%' : '0%' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Video Container with Curve */}
            <div className="w-full aspect-[16/10] relative overflow-hidden group shadow-sm" style={{ borderBottomLeftRadius: '10% 5%', borderBottomRightRadius: '10% 5%' }}>
              <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
              <video
                ref={videoRef}
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              {/* Navigation Dots Indicator (Floating on Video) */}
              <div className="absolute top-4 left-0 w-full z-20 px-6 flex justify-between pointer-events-none">
                {managementServicesData.map((_, index) => (
                  <div key={`dot-${index}`} className="flex-1 flex justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 shadow-lg ${activeVideoIndex === index ? 'bg-white scale-[1.5]' : 'bg-white/40'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Briefing Area */}
          <div className=" w-[78%] lg:col-span-5 relative left-[-30px] lg:left-[70px] bottom-[40px] lg:bottom-[-40px] flex flex-col lg:pt-[100px]">
            <div className="border-l border-[#C7A58A]/30 pl-8 lg:pl-12 flex flex-col gap-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideoIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex flex-col gap-16"
                >
                  {managementServicesData[activeVideoIndex].briefs.map((brief, bIndex) => (
                    <motion.div 
                      key={bIndex} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: bIndex * 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="relative right-[-30px]"
                    >
                      <div className="absolute -left-[36px] lg:-left-[52px] top-1 w-2 h-2 rounded-full bg-[#2E2E2C]" />
                      <span className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8F8A84] block mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                        Brief {brief.id}
                      </span>
                      <h4 className={`text-[26px] text-[#1a1a19] mb-4 ${bIndex === 0 || bIndex === 2 ? 'italic' : ''}`} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {brief.title}
                      </h4>
                      <p className="text-[#5a5651] text-[15px] leading-[1.8] font-light" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                        {brief.text}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================== */}
      {/* 3. CLIENT REVIEWS SECTION                      */}
      {/* ============================================== */}
      <section className="w-full lg:w-full px-6 md:px-12 relative lg:right-[-70px] lg:top-[450px] top-[320px] lg:px-24 max-w-[1400px] mx-auto mb-32 lg:mb-48">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-24 items-center">

          {/* Left: Text */}
          <div className="w-full relative right-[-20px] lg:right-0 lg:w-5/12 flex flex-col justify-center">
            <span className="text-[14px] relative top-[-20px] lg:top-[-70px] text-[#1a1a19] mb-4 lg:mb-8 font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              What villa owners say
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeTestimonial.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col relative top-[0px] lg:top-0 min-h-[160px] lg:min-h-[180px]"
              >
                <h2 className="text-[24px] w-[360px] lg:w-[100%] relative top-[-6px] lg:top-[20px] md:text-[44px] lg:text-[48px] leading-[1.1] text-[#1a1a19] mb-5 lg:mb-6 tracking-tight font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  {activeTestimonial.quote}
                </h2>
                <p className="text-[13px] relative top-[16px] lg:top-[50px] md:text-[16px] text-[#68635c] leading-[1.6] lg:leading-[1.7] max-w-[95%]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  {activeTestimonial.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Image */}
          <div className="w-[95%] lg:w-7/12 h-[280px] md:h-[350px] lg:h-[450px] relative right-[-1px] lg:right-0 rounded-[20px] lg:rounded-[16px] overflow-hidden bg-[#e0dcd5]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${activeTestimonial.id}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image src={activeTestimonial.image} alt={activeTestimonial.name} fill className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Tabs at the bottom */}
        <div className="grid grid-cols-2 lg:flex w-full items-end relative left-[30px] lg:left-0 bottom-[-20px] lg:bottom-[-50px] justify-between mt-12 lg:mt-12 gap-x-2 gap-y-4 lg:gap-0 lg:gap-x-16 lg:gap-y-10">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveId(t.id)}
              className={`flex-1 cursor-pointer pb-4 border-b transition-colors duration-300 ${activeId === t.id ? 'border-[#1a1a19]' : 'border-[#1a1a19]/10'}`}
            >
              <span className={`text-[15px] lg:text-[14px] transition-colors duration-300 ${activeId === t.id ? 'text-[#1a1a19] font-medium' : 'text-[#8F8A84] font-normal'}`} style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                {t.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================== */}
      {/* 4. FINAL CTA SECTION (PARALLAX)                */}
      {/* ============================================== */}
      <section ref={parallaxRef} className="w-full h-[500px] lg:h-[710px] relative top-[400px] lg:top-[668px] mt-auto overflow-hidden">
        <motion.div
          className="absolute inset-0 w-full h-[140%] -top-[20%] bg-cover bg-center bg-no-repeat"
          style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop)',
              y: yParallax
          }}
        />
        <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-r lg:from-[#1a1a19] lg:via-[#1a1a19]/80 lg:to-transparent z-10" />

        <div className="relative z-20 w-full h-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col items-center lg:items-start justify-center lg:right-[-70px] text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start"
          >
            <span className="text-white relative lg:top-[-30px] top-[-30px] text-[13px] md:text-[16px] mb-4 block font-medium tracking-wide" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              For villa owners
            </span>
            <h2 className="text-white text-[42px] md:text-[72px] lg:text-[88px] leading-[1.1] md:leading-[1.05] font-medium mb-6 tracking-tight max-w-[800px]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Your property <br className="lg:hidden" /> deserves better.
            </h2>
            <p className="text-white/80 relative bottom-[-40px] lg:bottom-[-20px] text-[14px] md:text-[17px] leading-[1.6] max-w-[350px] lg:max-w-[480px] mb-10 font-light" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Most villas in Bali sit half-empty. Yours doesn't have to. Partner with us and let's change that together.
            </p>

            <Magnetic>
              <button className="bg-white relative top-[70px] lg:top-[50px] rounded-full h-[64px] w-[320px] lg:w-max lg:px-8 flex items-center justify-between lg:justify-center lg:gap-4 transition-all hover:bg-gray-100 hover:scale-105 duration-300 shadow-xl px-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a19]" />
                <span className="text-[#1a1a19] text-[15px] font-bold" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  Partner with Summerhouse
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a19]" />
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
