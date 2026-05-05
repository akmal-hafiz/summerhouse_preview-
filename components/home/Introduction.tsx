"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Introduction = () => {
    return (
        <section className="w-full bg-[#FAF9F6] z-20 flex items-center min-h-[90dvh]  md:min-h-[90dvh] lg:min-h-[80dvh]  pt-[140px] pb-[120px] lg:pt-[180px] lg:pb-[180px] relative mt-[80px] lg:mt-[150px]">


























            {/* ✅ DIUBAH DI SINI */}
            <div className="w-full max-w-[1400px] min-h-[300px] mx-auto px-10 md:px-24 lg:px-24">

                <div className="grid grid-cols-1 -translate-y-4 md:-translate-y-8 lg:translate-y-0 md:grid-cols-12 gap-8 lg:gap-33 items-start">
                
                    {/* HEADING */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="md:col-span-8 lg:col-span-7"
                    >
                        <h2 
                            className="w-full flex md:justify-start md:translate-x-10 lg:translate-x-10 justify-center lg:justify-start translate-x-[-18px] lg:pr-[100px] text-[48px] md:text-5xl lg:text-[65px] leading-[1.2] tracking-[2] lg:tracking-normal text-[#446B4A]"
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                            A home, not a <br /> hotel
                        </h2>
                    </motion.div>

                    {/* TEXT */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8 mt-12 md:mt-0 2xl:translate-x-10"
                    >
                        <p 
                            className="text-[17px] md:text-[20px] flex translate-y-5 lg:-translate-y-4 translate-x-5 lg:translate-x-15 leading-[1.9] md:leading-[2] font-light text-[#5a5651] max-w-[480px]"
                            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                            <span className="block md:hidden text-[21px] leading-[1.6]">
                                We curate properties and <br />
                                designed environments that focus <br />
                                on and nurture comfort, simplicity, <br />
                                and ease. Space that invites you <br />
                                to <br />
                                rethink, slow down, and <br />
                                experience life in a way that feels <br />
                                natural and personal.
                            </span>
                            
                            <span className="hidden md:block justify-center lg:translate-y-12 -translate-x-10">
                                We curate properties and designed environments that focus on and nurture comfort, simplicity, and ease. Space that invites <br /> you to rethink, slow down, and experience life in a way that feels natural and personal.
                            </span>
                        </p>

                        {/* QUOTE */}
                        <div className="pl-5 md:pl-6 border-l-[3px] flex justify-start md:justify-center md:items-center translate-y-15 md:translate-y-27 lg:translate-y-30 translate-x-5 md:-translate-x-5 lg:translate-x-6 border-[#C7A58A] mt-16">
                            <span 
                                className="block text-[33px] translate-x-5 md:translate-x-6 lg:-translate-x-14 md:text-[34px] leading-snug text-[#1a1a19] italic ml-6 lg:ml-0"
                                style={{ fontFamily: "var(--font-playfair), serif" }}
                            >
                                As if you were living <br className="block md:hidden" /> here.
                            </span>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Introduction;