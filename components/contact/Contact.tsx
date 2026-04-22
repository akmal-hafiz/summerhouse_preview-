"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
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
                    animate={{ opacity: 1, y: 0 }}
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

const Contact = () => {
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

    return (
        <div className="w-full bg-[#FAFAF9] h-[367vh] lg:h-[500vh] flex flex-col pt-[160px] lg:pt-[200px]">
            
            {/* ========================================= */}
            {/* 1. HERO HEADER SECTION                    */}
            {/* ========================================= */}
            <section className="w-full relative lg:left-[360px] bottom-[-170px] lg:bottom-[-200px] px-6 flex flex-col items-center text-center max-w-[800px] mx-auto mb-20 lg:mb-32 pt-20 lg:pt-0">
                <motion.h1 
                    className="text-[28px] md:text-6xl lg:text-[72px] leading-[1.8] lg:leading-[1.7] text-[#446B4A] lg:text-[#446B4A] mb-6 lg:mb-8 tracking-[-0.02em] font-bold lg:font-medium text-center"
                    style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                >
                    <CharacterReveal text="Connect with our team" />
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-[#68635c] lg:text-[#5a5651] text-[14px] md:text-[18px] font-normal lg:font-light leading-[1.6] max-w-[280px] md:max-w-[400px] lg:max-w-[600px] text-center"
                    style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                >
                    Have a question or need assistance? Whether it's about your booking, or anything else - just reach out. We'd love to hear from you!
                </motion.p>
            </section>

            {/* ========================================= */}
            {/* 2. PARALLAX FORM SECTION                  */}
            {/* ========================================= */}
            <section ref={parallaxRef} className="w-full h-[95vh] lg:h-[130vh] relative lg:bottom-[-400px] bottom-[-290px] py-24 lg:py-33 overflow-hidden">
                <motion.div 
                    className="absolute inset-0 w-full h-[140%] -top-[20%] bg-cover bg-center bg-no-repeat" 
                    style={{ 
                        backgroundImage: 'url(https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2080&auto=format&fit=crop)',
                        y: yParallax
                    }}
                ></motion.div>
                <div className="absolute inset-0 bg-black/40"></div>
                
                <div className="relative right-[-40px] lg:right-[-350px] bottom-[-36px] lg:bottom-[-250px] z-10 max-w-[1300px] mx-auto px-6 w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-[40px] relative left-[-20px] lg:left-[-18px] top-[5px] lg:top-[-150px] px-8 py-16 md:px-24 md:py-24 lg:px-[180px] lg:py-[280px] min-h-[770px] lg:min-h-[760px] w-[90%] lg:w-[68%] shadow-2xl flex items-center justify-start"
                    >
                        <form className="flex flex-col gap-6 lg:gap-8 relative bottom-[5px] lg:bottom-[0px] right-[-30px] lg:right-[-50px] w-[80%] lg:w-[100%] max-w-[800px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="flex flex-col gap-2.5 lg:gap-3">
                                    <label className="text-[14px] font-bold lg:font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>First name *</label>
                                    <input type="text" placeholder="Jane" className="h-[58px] lg:h-[56px] rounded-full lg:rounded-[12px] bg-[#F5F5F4] lg:bg-[#FAFAF9] border-none lg:border lg:border-[#E5E5E5] outline-none focus:ring-1 focus:ring-[#446B4A] transition-all font-light text-[15px] placeholder-[#8F8A84]" style={{ paddingLeft: '24px', paddingRight: '24px' }} />
                                </div>
                                <div className="flex flex-col gap-2.5 lg:gap-3">
                                    <label className="text-[14px] font-bold lg:font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Last name</label>
                                    <input type="text" placeholder="Smith" className="h-[58px] lg:h-[56px] rounded-full lg:rounded-[12px] bg-[#F5F5F4] lg:bg-[#FAFAF9] border-none lg:border lg:border-[#E5E5E5] outline-none focus:ring-1 focus:ring-[#446B4A] transition-all font-light text-[15px] placeholder-[#8F8A84]" style={{ paddingLeft: '24px', paddingRight: '24px' }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="flex flex-col gap-2.5 lg:gap-3">
                                    <label className="text-[14px] font-bold lg:font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Phone number</label>
                                    <input type="tel" placeholder="+1 (555) 123-4567" className="h-[58px] lg:h-[56px] rounded-full lg:rounded-[12px] bg-[#F5F5F4] lg:bg-[#FAFAF9] border-none lg:border lg:border-[#E5E5E5] outline-none focus:ring-1 focus:ring-[#446B4A] transition-all font-light text-[15px] placeholder-[#8F8A84]" style={{ paddingLeft: '24px', paddingRight: '24px' }} />
                                </div>
                                <div className="flex flex-col gap-2.5 lg:gap-3">
                                    <label className="text-[14px] font-bold lg:font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Email *</label>
                                    <input type="email" placeholder="smith@email.com" className="h-[58px] lg:h-[56px] rounded-full lg:rounded-[12px] bg-[#F5F5F4] lg:bg-[#FAFAF9] border-none lg:border lg:border-[#E5E5E5] outline-none focus:ring-1 focus:ring-[#446B4A] transition-all font-light text-[15px] placeholder-[#8F8A84]" style={{ paddingLeft: '24px', paddingRight: '24px' }} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5 lg:gap-3">
                                <label className="text-[14px] font-bold lg:font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Message *</label>
                                <textarea placeholder="Give us more info..." className="h-[140px] lg:h-[160px] p-6 lg:p-5 rounded-[24px] lg:rounded-[12px] bg-[#F5F5F4] lg:bg-[#FAFAF9] border-none lg:border lg:border-[#E5E5E5] outline-none focus:ring-1 focus:ring-[#446B4A] transition-all font-light text-[15px] resize-none placeholder-[#8F8A84]" style={{ paddingLeft: '24px', paddingRight: '24px' }}></textarea>
                            </div>
                            <Magnetic>
                                <button type="submit" className="w-[100%] relative bottom-[-6px] lg:bottom-0px right-[-4px] lg:right-0 lg:w-full h-[40px] lg:h-[60px] bg-black lg:bg-[#1a1a19] text-white rounded-full lg:rounded-[12px] font-bold lg:font-medium tracking-wide text-[16px] hover:bg-[#2a2a29] transition-all mt-4 lg:mt-2 shadow-lg lg:shadow-none" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                    Submit
                                </button>
                            </Magnetic>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* ========================================= */}
            {/* 3. CONTACT INFO SECTION                   */}
            {/* ========================================= */}
            <section className="w-full max-w-[1400px] relative lg:right-[-80px] bottom-[-370px] lg:bottom-[-700px] mx-auto px-6 md:px-12 lg:px-24 py-16 lg:py-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-[88%] lg:w-full aspect-square lg:aspect-[4/5] rounded-[32px] lg:rounded-[24px] overflow-hidden relative right-[-25px] lg:right-0 shadow-2xl"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop" 
                            alt="Resort Pool" 
                            className="w-full h-full object-cover" 
                        />
                    </motion.div>
                    
                    {/* Right: Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col lg:pl-0 relative bottom-[-8px] lg:bottom-0 right-[-25px] lg:right-0"
                    >
                        <span className="text-[14px] relative bottom-[20px] lg:bottom-0 font-medium text-[#1a1a19] mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Our location</span>
                        <h2 className="text-[28px] lg:text-[64px] relative bottom-[8px] lg:bottom-0 font-bold  lg:font-medium tracking-tight text-[#1a1a19] mb-6 leading-[1.1]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                            Contact information
                        </h2>
                        <p className="text-[#68635c] relative bottom-[-6px] lg:bottom-0 lg:text-[#5a5651] text-[14px] lg:text-[18px] font-normal lg:font-light leading-[1.6] mb-10 lg:mb-12 max-w-[350px] lg:max-w-[500px]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                            Need to reach us? Here's how you can get in touch. Call, email, or visit - our team is ready to assist you with anything you need before, during, or after stay.
                        </p>
                        
                        <div className="w-[78%] lg:w-full relative top-[22px] lg:top-0 h-[1px] bg-[#2E2E2C] mb-10"></div>
                        
                        <div className="flex flex-col gap-8 relative bottom-[-40px] lg:bottom-0">
                            <div className="flex items-center gap-5 lg:gap-6 group cursor-pointer">
                                <div className="lg:w-12 lg:h-12 lg:rounded-full lg:bg-[#FAFAF9] lg:border lg:border-[#E5E5E5] flex items-center justify-center lg:group-hover:bg-[#1a1a19] lg:group-hover:text-white transition-colors duration-300">
                                    <FiMapPin className="text-[20px] lg:text-xl text-black lg:text-current" />
                                </div>
                                <span className="text-[16px] text-[#161615] font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Jl. Raya Campuhan, Ubud, Bali 80571</span>
                            </div>
                            <div className="flex items-center gap-5 lg:gap-6 group cursor-pointer">
                                <div className="lg:w-12 lg:h-12 lg:rounded-full lg:bg-[#FAFAF9] lg:border lg:border-[#E5E5E5] flex items-center justify-center lg:group-hover:bg-[#1a1a19] lg:group-hover:text-white transition-colors duration-300">
                                    <FiPhone className="text-[20px] lg:text-xl text-black lg:text-current" />
                                </div>
                                <span className="text-[16px] text-[#1a1a19] font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>+62 811 388 999</span>
                            </div>
                            <div className="flex items-center gap-5 lg:gap-6 group cursor-pointer">
                                <div className="lg:w-12 lg:h-12 lg:rounded-full lg:bg-[#FAFAF9] lg:border lg:border-[#E5E5E5] flex items-center justify-center lg:group-hover:bg-[#1a1a19] lg:group-hover:text-white transition-colors duration-300">
                                    <FiMail className="text-[20px] lg:text-xl text-black lg:text-current" />
                                </div>
                                <span className="text-[16px] text-[#1a1a19] font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>hello@summerhousebali.com</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========================================= */}
            {/* 4. DISCOVER & STATS (DARK)                */}
            {/* ========================================= */}
            <section className="w-full bg-[#0a0a0a] lg:h-[100vh] h-[130vh] pt-32 pb-24 px-6 md:px-12 relative bottom-[-490px] lg:bottom-[-1000px] mt-20 z-20 overflow-visible">
                {/* Overlapping Polaroids */}

                <div className="lg:max-w-[1300px] relative left-[-68px] lg:left-[38px] max-w-[400px] w-[350px] lg:w-full mx-auto flex flex-col items-center relative z-10 mt-12">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-2xl relative bottom-[-80px] lg:bottom-[-50px] lg:right-[-88px] right-[-100px] md:text-5xl lg:text-[60px] font-medium tracking-tight text-white mb-16 text-center leading-[1.1]" 
                        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                    >
                        Discover our rooms &<br/>enjoy your stay
                    </motion.h2>
                    
                    {/* Inline Booking Form */}
                    <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-4 mb-24 relative bottom-[-150px] lg:bottom-[-160px] right-[-100px]">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-white text-[13px] font-medium pl-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Full name*</label>
                            <div className="relative">
                                <input type="text" placeholder="Alex Johnson" className="w-full h-[56px] rounded-full bg-white/[0.08] border border-white/20 px-6 text-white outline-none focus:border-white/50 transition-colors font-light" style={{ paddingLeft: '20px', paddingRight: '20px' }} />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-serif italic text-sm">Aa</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-white text-[13px] font-medium pl-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Email*</label>
                            <div className="relative">
                                <input type="email" placeholder="johnson@mail.com" className="w-full h-[56px] rounded-full bg-white/[0.08] border border-white/20 px-6 text-white outline-none focus:border-white/50 transition-colors font-light" style={{ paddingLeft: '20px', paddingRight: '20px' }} />
                                <FiMail className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-white text-[13px] font-medium pl-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Guests</label>
                            <div className="relative">
                                <select className="w-full h-[56px] rounded-full bg-white/[0.08] border border-white/20 px-6 text-white outline-none focus:border-white/50 appearance-none cursor-pointer font-light" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                                    <option value="1" className="bg-[#1a1a19] ">1 guest</option>
                                    <option value="2" className="bg-[#1a1a19]" defaultValue="2">2 guests</option>
                                    <option value="3" className="bg-[#1a1a19]">3 guests</option>
                                    <option value="4" className="bg-[#1a1a19]">4+ guests</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-white text-[13px] font-medium pl-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Rooms</label>
                            <div className="relative">
                                <select className="w-full h-[56px] rounded-full bg-white/[0.08] border border-white/20 px-6 text-white outline-none focus:border-white/50 appearance-none cursor-pointer font-light" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                                    <option value="" disabled className="bg-[#1a1a19]">Select...</option>
                                    <option value="1" className="bg-[#1a1a19]">1 room</option>
                                    <option value="2" className="bg-[#1a1a19]">2 rooms</option>
                                    <option value="3" className="bg-[#1a1a19]">3+ rooms</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col relative bottom-[-20px] lg:bottom-[4px] justify-end lg:w-auto mt-4 lg:mt-0">
                            <button className="h-[56px] px-8 bg-white text-[#1a1a19] rounded-full font-medium tracking-wide flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors w-full lg:w-[260px]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                <div className="w-[5px] h-[5px] rounded-full bg-[#1a1a19]" />
                                Book your stay
                                <div className="w-[5px] h-[5px] rounded-full bg-[#1a1a19]" />
                            </button>
                        </div>
                    </div>

                    <div className="w-[1200px] lg:w-[128%] relative bottom-[-245px] lg:bottom-0px h-[1px] bg-white/90 mb-20"></div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 w-full relative bottom-[-280px] lg:bottom-[-305px] right-[-95px] lg:right-[-145px]">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="flex flex-col items-center lg:items-start text-center lg:text-left"
                        >
                            <span className="text-[64px] md:text-[80px] lg:text-[100px] font-medium text-white/90 leading-[1] tracking-tighter" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>4.9</span>
                            <span className="text-white/60 text-[14px] mt-4 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Average Guest Rating</span>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-col items-center lg:items-start text-center lg:text-left"
                        >
                            <span className="text-[64px] md:text-[80px] lg:text-[100px] font-medium text-white/90 leading-[1] tracking-tighter" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>10K+</span>
                            <span className="text-white/60 text-[14px] mt-4 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Happy Guests Hosted</span>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="flex flex-col items-center lg:items-start text-center lg:text-left"
                        >
                            <span className="text-[64px] md:text-[80px] lg:text-[100px] font-medium text-white/90 leading-[1] tracking-tighter" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>19</span>
                            <span className="text-white/60 text-[14px] mt-4 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Stylishly Designed Rooms</span>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col items-center lg:items-start text-center lg:text-left"
                        >
                            <span className="text-[64px] md:text-[80px] lg:text-[100px] font-medium text-white/90 leading-[1] tracking-tighter" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>365</span>
                            <span className="text-white/60 text-[14px] mt-4 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Days of Warm Service</span>
                        </motion.div>
                    </div>

                </div>
            </section>

        </div>
    );
};

export default Contact;
