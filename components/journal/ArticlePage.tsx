"use client";

import { motion, useScroll, useSpring, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug } from "@/data/articles";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

/* ──────────────────────────────────────────────────────── */
/*  ANIMATION VARIANTS                                      */
/* ──────────────────────────────────────────────────────── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 70 }, // Anda bisa atur jarak "jauh"nya di sini (misal y: 75)
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

/* ──────────────────────────────────────────────────────── */
/*  CONTENT COMPONENTS                                      */
/* ──────────────────────────────────────────────────────── */

const ParagraphBlock = ({ text, isFirst = false }: { text: string; isFirst?: boolean }) => (
  <motion.div 
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-10% 0px" }}
    className="mb-12" // Gunakan margin untuk jarak antar paragraf agar aman
  >
    <p className={`
      font-sans w-[300px] md:w-[500px] text-[14px] md:text-[18px] leading-[1.8] text-[#4a5345] font-light tracking-wide
      ${isFirst ? "first-letter:float-left first-letter:text-8xl first-letter:pr-6 first-letter:font-serif first-letter:text-[#3b5249] first-line:uppercase first-line:tracking-widest" : ""}
    `}>
      {text}
    </p>
  </motion.div>
);

const HeadingBlock = ({ text }: { text: string }) => (
  <motion.div 
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="mt-20 mb-12 text-center"
  >
    <h2 className="font-serif text-[26px] md:text-[36px] leading-[1.3] text-[#2d3329] font-semibold tracking-tight">
      {text}
    </h2>
  </motion.div>
);

const QuoteBlock = ({ text }: { text: string }) => (
  <motion.div 
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="my-16 py-8 px-10 md:px-16 bg-[#f4f0ea]/50 border-l-4 border-[#a67a5b] rounded-r-lg text-center"
  >
    <p className="font-serif text-[20px] md:text-[24px] leading-[1.4] text-[#2d3329] italic font-medium">
      "{text}"
    </p>
  </motion.div>
);

const ImageBlock = ({ src, caption }: { src: string; caption?: string }) => (
  <motion.div 
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="w-full my-16 md:my-24"
  >
    <figure className="max-w-6xl mx-auto">
      <div className="aspect-[4/2]  bg-[#f4f0ea] rounded-xl overflow-hidden shadow-lg relative">
        <Image 
            src={src} 
            alt={caption || "Article image"} 
            fill 
            className="object-cover" 
            sizes="100vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-6 text-center max-w-2xl mx-auto">
          <span className="font-sans text-[14px] italic text-[#8a9386] leading-relaxed block">
            Figure 1. {caption}
          </span>
        </figcaption>
      )}
    </figure>
  </motion.div>
);

/* ──────────────────────────────────────────────────────── */
/*  HERO SECTION                                            */
/* ──────────────────────────────────────────────────────── */

const ArticleHero = ({ article }: { article: any }) => (
  <section className="relative w-full h-[85vh] min-h-[600px] flex items-end">
    <div className="absolute inset-0 z-0">
      <Image
        src={article.heroImage}
        alt={article.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
    </div>
    
    <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-[800px]"
      >
        <span className="font-sans text-[#a67a5b] text-[13px] font-bold uppercase tracking-[0.2em] mb-6 block">
          Slow Living Journal
        </span>
        <h1 className="font-serif text-[42px] md:text-[56px] lg:text-[64px] leading-[1.1] text-white mb-8 font-semibold drop-shadow-md">
          {article.title.includes(":") ? (
            <>
              {article.title.split(":")[0]}:<br/>
              {article.title.split(":")[1]}
            </>
          ) : article.title}
        </h1>
        <p className="font-sans text-[22px] text-white/90 mb-10 max-w-[600px] font-light leading-[1.8]">
          {article.subtitle}
        </p>

        <div className="flex items-center gap-5 border-t border-white/20 pt-8">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#f4f0ea] relative">
            <Image 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" 
                alt="Isabella Rossi"
                fill
                className="object-cover"
            />
          </div>
          <div>
            <p className="font-sans text-[14px] text-white font-bold tracking-wide">Isabella Rossi</p>
            <p className="font-sans text-[14px] text-white/70 mt-1">October 24, 2024 · 12 min read</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ──────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                          */
/* ──────────────────────────────────────────────────────── */

export default function ArticlePage({ slug }: { slug: string }) {
  const article = getArticleBySlug(slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (!article) return <div className="h-screen flex items-center justify-center font-serif italic text-2xl">Article Not Found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7] text-[#2d3329] antialiased selection:bg-[#3b5249]/20 selection:text-[#3b5249]">
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-[#a67a5b] origin-left z-[100]" style={{ scaleX }} />
      <Navbar alwaysSolid={false} />

      <main className="flex-grow">
        <ArticleHero article={article} />

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-20 -mt-[100px] md:-mt-[150px] pb-24 md:pb-32">
          <div className="bg-white p-8 md:p-16 lg:p-24 shadow-xl rounded-2xl">
          <article>
            <div className="article-body">
              {article.content.map((block, index) => {
                switch (block.type) {
                  case "paragraph":
                    return <ParagraphBlock key={index} text={block.text!} isFirst={index === 0} />;
                  case "heading":
                    return <HeadingBlock key={index} text={block.text!} />;
                  case "quote":
                    return <QuoteBlock key={index} text={block.text!} />;
                  case "image":
                    return <ImageBlock key={index} src={block.src!} caption={block.caption} />;
                  default:
                    return null;
                }
              })}
            </div>

            {/* Tags - Pill Style */}
            <div className="flex flex-wrap justify-center gap-4 mt-16 pt-10 border-t border-[#ebe4da]">
              {["Slow Living", "Architecture", "Mindfulness"].map((tag) => (
                <span key={tag} className="px-5 py-2 bg-[#f4f0ea] rounded-full font-sans text-[13px] text-[#4a5345] font-bold uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>

        {/* Booking Inquiry Section */}
        <section className="w-full bg-[#3b5249] py-24 px-8 mt-12 mb-20 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-[36px] md:text-[42px] leading-[1.3] mb-6 font-semibold">
              Experience the Architecture of Silence
            </h2>
            <p className="font-sans text-[22px] text-[#c1d0c6] mb-10 font-light leading-[1.8]">
              Retreat to Villa Serenity and immerse yourself in the profound peace of Bali's slow living. Discover spaces designed for breath, thought, and deep restoration.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="px-10 py-4 bg-[#a67a5b] text-white font-sans text-[13px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#a67a5b]/90 transition-colors duration-300">
                Inquire Availability
              </button>
              <button className="px-10 py-4 border border-[#c1d0c6] text-white font-sans text-[13px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/10 transition-colors duration-300">
                Explore the Villa
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
