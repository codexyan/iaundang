"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play, MapPin } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface MockupData {
  groomName?: string;
  brideName?: string;
  date?: string;
  venue?: string;
}

export default function HeroSection({
  content,
  mockup,
}: {
  content?: HeroContent;
  mockup?: MockupData;
}) {
  const hero = {
    ctaPrimary: content?.ctaPrimary ?? "Coba Gratis Sekarang",
    ctaSecondary: content?.ctaSecondary ?? "Lihat Demo",
    subheadline: content?.subheadline ?? "Setiap tamu menerima undangan dengan namanya sendiri. Musik mengalun saat dibuka, RSVP langsung dari HP — tanpa install apapun.",
  };

  const mockupData = {
    groomName: mockup?.groomName ?? "Rizky",
    brideName: mockup?.brideName ?? "Aulia",
    date: mockup?.date ?? "12 · 04 · 2026",
    venue: mockup?.venue ?? "Hotel Grand Ballroom, Jakarta",
  };

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "5%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#fafaf9]" style={{ minHeight: "100svh" }}>
      {/* Single subtle ambient */}
      <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.03] pointer-events-none" style={{ background: "#2c4a34" }} />

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Undangan Digital Premium
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="mt-6 font-serif text-stone-900 leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Undangan digital yang
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #2c4a34 0%, #4a6355 40%, #b8954d 80%, #c9a961 100%)" }}>
                elegan &amp; personal
              </span>
              <br />
              untuk setiap tamu.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              className="mt-5 text-[15px] sm:text-base leading-[1.7] text-stone-500 max-w-[440px]"
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/templates" className="group">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl text-white text-[15px] font-semibold overflow-hidden shadow-lg shadow-forest-900/10 hover:shadow-xl hover:shadow-forest-900/15 transition-shadow"
                  style={{ background: "linear-gradient(135deg, #2c4a34 0%, #3a5a40 100%)" }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    {hero.ctaPrimary}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </motion.span>
              </Link>
              <Link href="/demo/renderer?id=javanese-gold">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl text-[15px] font-medium text-stone-600 bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-sm">
                    <Play size={10} className="fill-white text-white ml-0.5" />
                  </span>
                  {hero.ctaSecondary}
                </motion.span>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              className="mt-5 text-[12px] text-stone-400"
            >
              Gratis coba · Sekali bayar · Tanpa langganan
            </motion.p>
          </div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[240px] sm:w-[270px]"
            >
              <div className="relative rounded-[32px] sm:rounded-[36px] overflow-hidden"
                style={{
                  padding: "6px",
                  background: "linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #0a0a0a 100%)",
                  boxShadow: "0 40px 80px -16px rgba(0,0,0,0.18), 0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}>
                <div className="absolute right-[-1px] top-[25%] w-[2px] h-8 rounded-l bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="absolute left-[-1px] top-[20%] w-[2px] h-5 rounded-r bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="absolute left-[-1px] top-[30%] w-[2px] h-8 rounded-r bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="absolute left-1/2 -translate-x-1/2 z-30" style={{ top: 10, width: 72, height: 18 }}>
                  <div className="w-full h-full bg-black rounded-full" />
                </div>

                <div className="rounded-[27px] sm:rounded-[31px] overflow-hidden relative" style={{ aspectRatio: "9/19.5", backgroundColor: "#0c1a0f" }}>
                  <Image src="/images/templates/wedding-bg.jpg" alt="Preview undangan digital iaundang" fill className="object-cover" sizes="270px" quality={90} priority style={{ opacity: 0.35 }} />
                  <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(180deg, rgba(12,26,15,0.4) 0%, rgba(12,26,15,0.6) 50%, rgba(12,26,15,0.95) 100%)" }} />

                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
                    className="absolute left-1/2 -translate-x-1/2 top-[15%] w-px h-[12%] z-10 origin-top"
                    style={{ background: "linear-gradient(180deg, transparent, #c9a961, transparent)" }} />

                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                    <div className="text-center px-6">
                      <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.15em" }}
                        animate={isInView ? { opacity: 1, letterSpacing: "0.35em" } : {}}
                        transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
                        className="text-[9px] sm:text-[10px] uppercase mb-6 sm:mb-8 font-medium"
                        style={{ color: "#c9a961" }}>
                        The Wedding of
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}>
                        <h2 className="text-[32px] sm:text-[38px] font-bold leading-[0.85]"
                          style={{ color: "#fff", fontFamily: "var(--font-playfair), 'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                          {mockupData.groomName}
                        </h2>
                        <p className="text-xl sm:text-2xl my-1.5" style={{ color: "#c9a961", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 300, fontStyle: "italic" }}>&amp;</p>
                        <h2 className="text-[32px] sm:text-[38px] font-bold leading-[0.85]"
                          style={{ color: "#fff", fontFamily: "var(--font-playfair), 'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                          {mockupData.brideName}
                        </h2>
                      </motion.div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : {}}
                        transition={{ delay: 1.1, duration: 0.6, ease: EASE }}
                        className="mx-auto mt-5 w-16 h-px origin-center"
                        style={{ background: "linear-gradient(90deg, transparent, #c9a961, transparent)" }} />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 1.3, duration: 0.5 }}
                        className="mt-4 space-y-1.5">
                        <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{mockupData.date}</p>
                        <div className="flex items-center justify-center gap-1">
                          <MapPin size={8} style={{ color: "rgba(255,255,255,0.35)" }} />
                          <p className="text-[8px] sm:text-[9px] tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>{mockupData.venue}</p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="mt-6 sm:mt-8">
                        <div className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide uppercase"
                          style={{ color: "#c9a961", border: "1px solid rgba(201,169,97,0.3)", background: "rgba(201,169,97,0.06)" }}>
                          Buka Undangan
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-24 h-1 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-[50%] blur-md"
                style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)" }} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none z-10" style={{ background: "linear-gradient(to bottom, transparent, #fafaf9)" }} />
    </section>
  );
}
