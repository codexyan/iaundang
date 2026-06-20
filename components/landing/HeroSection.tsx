"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from "framer-motion";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Play,
  Star,
  Heart,
  Check,
  MapPin,
  Music,
} from "lucide-react";

//  Orchestrated entrance timing 
const T = {
  badge: 0.3,
  headline: 0.5,
  sub: 0.7,
  proof: 0.9,
  cta: 1.05,
  phone: 0.4,
  phoneParts: 1.2,
  indicators: 1.6,
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

//  Floating notification cards 
const FLOAT_CARDS = [
  {
    delay: T.indicators,
    position: { top: "12%", right: "-8%" },
    icon: Check,
    value: "24",
    label: "RSVP Hadir",
    accent: "#2c4a34",
    bg: "#f0f7f2",
  },
  {
    delay: T.indicators + 0.2,
    position: { bottom: "22%", right: "-6%" },
    icon: Heart,
    value: "312",
    label: "Ucapan",
    accent: "#c9a961",
    bg: "#fefdf8",
  },
  {
    delay: T.indicators + 0.4,
    position: { bottom: "48%", left: "-7%" },
    icon: Music,
    value: "",
    label: "Now Playing",
    accent: "#78716c",
    bg: "#fafaf9",
  },
];

//  Ambient gradient orb 
function AmbientOrb({
  delay = 0,
  size = 300,
  color,
  className = "",
}: {
  delay?: number;
  size?: number;
  color: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 90 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 90 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left - rect.width / 2) / 30);
      mouseY.set((e.clientY - rect.top - rect.height / 2) / 30);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1.5, ease: EASE_OUT_EXPO }}
      style={{ x: springX, y: springY }}
      className={`absolute pointer-events-none ${className}`}
    >
      <div
        className="rounded-full blur-[100px]"
        style={{ width: size, height: size, background: color }}
      />
    </motion.div>
  );
}

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  socialProofCount: string;
  socialProofRating: string;
}

interface MockupData {
  groomName?: string
  brideName?: string
  date?: string
  venue?: string
}

export default function HeroSection({ content, mockup }: { content?: HeroContent; mockup?: MockupData }) {
  const hero = {
    headline:
      content?.headline ??
      "Undangan digital yang bikin tamu kagum sejak klik pertama",
    subheadline:
      content?.subheadline ??
      "Tamu klik link → musik mengalir → nama mereka muncul → foto kalian tersaji cantik. Pengalaman premium tanpa ribet.",
    ctaPrimary: content?.ctaPrimary ?? "Buat Undangan Sekarang",
    ctaSecondary: content?.ctaSecondary ?? "Lihat Demo",
    socialProofCount: content?.socialProofCount ?? "500+",
    socialProofRating: content?.socialProofRating ?? "4.9",
  };

  const mockupData = {
    groomName: mockup?.groomName ?? 'Rizky',
    brideName: mockup?.brideName ?? 'Aulia',
    date: mockup?.date ?? '12 · 04 · 2026',
    venue: mockup?.venue ?? 'Hotel Grand Ballroom, Jakarta',
  };

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#fafaf9]"
      style={{ minHeight: "100svh" }}
    >
      {/*  Ambient background  */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <AmbientOrb
          delay={0.2}
          size={500}
          color="rgba(44,74,52,0.06)"
          className="top-[-10%] right-[10%]"
        />
        <AmbientOrb
          delay={0.4}
          size={400}
          color="rgba(201,169,97,0.05)"
          className="top-[30%] left-[-5%]"
        />
        <AmbientOrb
          delay={0.6}
          size={350}
          color="rgba(143,169,154,0.06)"
          className="bottom-[10%] right-[20%]"
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, #d6d3d1 0.8px, transparent 0.8px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
          }}
        />
      </motion.div>

      {/*  Main Content  */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 sm:gap-14 lg:gap-20 items-center">
          {/*  Left: Copy  */}
          <div className="max-w-xl lg:max-w-none">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: T.badge, ease: EASE_OUT_EXPO }}
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
                Platform Undangan Digital #1
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: T.headline, ease: EASE_OUT_EXPO }}
              className="mt-6 sm:mt-7 font-serif leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              <span className="text-stone-900">Undangan digital</span>
              <br />
              <span className="relative">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #2c4a34 0%, #4a6355 40%, #b8954d 80%, #c9a961 100%)",
                  }}
                >
                  yang bikin tamu kagum
                </span>
                <motion.svg
                  viewBox="0 0 286 8"
                  fill="none"
                  className="absolute -bottom-2 left-0 w-full"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ delay: T.headline + 0.5, duration: 0.8, ease: "easeOut" }}
                >
                  <motion.path
                    d="M2 5.5C50 2 100 2 143 3.5C186 5 236 5.5 284 2.5"
                    stroke="url(#underlineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ delay: T.headline + 0.5, duration: 0.8, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="underlineGrad" x1="0" y1="0" x2="286" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2c4a34" />
                      <stop offset="0.5" stopColor="#8fa99a" />
                      <stop offset="1" stopColor="#c9a961" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              <br />
              <span className="text-stone-900">sejak klik pertama.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: T.sub, ease: EASE_OUT_EXPO }}
              className="mt-5 sm:mt-6 text-[15px] sm:text-[17px] leading-[1.7] text-stone-500 max-w-md"
            >
              {hero.subheadline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: T.cta, ease: EASE_OUT_EXPO }}
              className="mt-8 sm:mt-9 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/templates" className="group">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl text-white text-[15px] font-semibold overflow-hidden shadow-lg shadow-forest-900/15 transition-shadow duration-300 hover:shadow-xl hover:shadow-forest-900/20"
                  style={{
                    background: "linear-gradient(135deg, #2c4a34 0%, #3a5a40 100%)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    {hero.ctaPrimary}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </motion.span>
              </Link>

              <Link href="/demo/renderer?id=javanese-gold" className="group">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl text-[15px] font-medium text-stone-600 bg-white border border-stone-200/80 hover:border-stone-300 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-sm">
                    <Play size={10} className="fill-white text-white ml-0.5" />
                  </span>
                  {hero.ctaSecondary}
                </motion.span>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: T.proof, ease: EASE_OUT_EXPO }}
              className="mt-9 sm:mt-10 flex items-center gap-5 flex-wrap"
            >
              <div className="flex items-center gap-3">
                {/* Stacked avatars */}
                <div className="flex -space-x-2.5">
                  {[
                    "linear-gradient(135deg, #d4c589, #c9a961)",
                    "linear-gradient(135deg, #8fa99a, #6fa88a)",
                    "linear-gradient(135deg, #b8954d, #c9a961)",
                    "linear-gradient(135deg, #5d7a6a, #4a6355)",
                  ].map((bg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: -4 }}
                      animate={isInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                      transition={{
                        delay: T.proof + 0.1 + i * 0.06,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="w-8 h-8 rounded-full border-[2.5px] border-[#fafaf9] shadow-sm"
                      style={{ background: bg, zIndex: 4 - i }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-gold-500 text-gold-500"
                      />
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-0.5">
                      {hero.socialProofRating}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    <span className="font-semibold text-stone-500">{hero.socialProofCount}</span>{" "}
                    pasangan sudah memilih
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-stone-200" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-forest-50 flex items-center justify-center">
                  <Check size={14} className="text-forest-500" />
                </div>
                <span className="text-[12px] text-stone-500">
                  Bayar sekali, <span className="font-medium text-stone-700">tanpa langganan</span>
                </span>
              </div>
            </motion.div>
          </div>

          {/*  Right: Phone Mockup  */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration: 1,
              delay: T.phone,
              ease: EASE_OUT_EXPO,
            }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Ambient glow behind phone */}
              <div className="absolute -inset-20 pointer-events-none">
                <div
                  className="absolute inset-0 rounded-full blur-[80px] opacity-40"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(201,169,97,0.25) 0%, rgba(44,74,52,0.08) 60%, transparent 80%)",
                  }}
                />
              </div>

              {/* Floating notification cards */}
              {FLOAT_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 16 }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          scale: 1,
                          y: [0, -4, 0],
                        }
                      : {}
                  }
                  transition={{
                    opacity: { delay: card.delay, duration: 0.5 },
                    scale: { delay: card.delay, duration: 0.5, type: "spring", stiffness: 200 },
                    y: {
                      delay: card.delay + 0.5,
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute z-20 hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-stone-100 shadow-lg shadow-stone-900/5"
                  style={card.position as React.CSSProperties}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bg }}
                  >
                    <card.icon size={14} style={{ color: card.accent }} />
                  </div>
                  <div className="min-w-0">
                    {card.value && (
                      <p className="text-xs font-bold text-stone-800 leading-none">
                        {card.value}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-400 leading-tight mt-0.5 whitespace-nowrap">
                      {card.label}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Phone device */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-[240px] sm:w-[280px]"
              >
                {/* Device frame */}
                <div
                  className="relative rounded-[32px] sm:rounded-[36px] overflow-hidden"
                  style={{
                    padding: "6px",
                    background:
                      "linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #0a0a0a 100%)",
                    boxShadow: `
                      0 50px 100px -20px rgba(0,0,0,0.3),
                      0 30px 60px -15px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.1),
                      inset 0 -1px 0 rgba(0,0,0,0.3)
                    `,
                  }}
                >
                  {/* Side button highlights */}
                  <div className="absolute right-[-1px] top-[25%] w-[2px] h-8 rounded-l bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  <div className="absolute left-[-1px] top-[20%] w-[2px] h-5 rounded-r bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  <div className="absolute left-[-1px] top-[30%] w-[2px] h-8 rounded-r bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                  {/* Dynamic Island */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center justify-center"
                    style={{ top: 10, width: 72, height: 18 }}
                  >
                    <div className="w-full h-full bg-black rounded-full" />
                  </div>

                  {/* Screen content */}
                  <div
                    className="rounded-[27px] sm:rounded-[31px] overflow-hidden relative"
                    style={{ aspectRatio: "9/19.5", backgroundColor: "#0c1a0f" }}
                  >
                    {/* Background image */}
                    <Image
                      src="/images/templates/wedding-bg.jpg"
                      alt="Preview undangan"
                      fill
                      className="object-cover"
                      sizes="280px"
                      quality={90}
                      priority
                      style={{ opacity: 0.35 }}
                    />

                    {/* Dark overlay layers */}
                    <div
                      className="absolute inset-0 z-[2]"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(12,26,15,0.4) 0%, rgba(12,26,15,0.6) 50%, rgba(12,26,15,0.95) 100%)",
                      }}
                    />

                    {/* Decorative gold line */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={isInView ? { scaleY: 1 } : {}}
                      transition={{ delay: T.phoneParts + 0.2, duration: 0.8, ease: EASE_OUT_EXPO }}
                      className="absolute left-1/2 -translate-x-1/2 top-[15%] w-px h-[12%] z-10 origin-top"
                      style={{ background: "linear-gradient(180deg, transparent, #c9a961, transparent)" }}
                    />

                    {/* Invitation content */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      <div className="text-center px-6">
                        {/* "The Wedding of" */}
                        <motion.p
                          initial={{ opacity: 0, letterSpacing: "0.15em" }}
                          animate={
                            isInView
                              ? { opacity: 1, letterSpacing: "0.35em" }
                              : {}
                          }
                          transition={{
                            delay: T.phoneParts,
                            duration: 0.8,
                            ease: EASE_OUT_EXPO,
                          }}
                          className="text-[9px] sm:text-[10px] uppercase mb-6 sm:mb-8 font-medium"
                          style={{ color: "#c9a961" }}
                        >
                          The Wedding of
                        </motion.p>

                        {/* Couple names */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{
                            delay: T.phoneParts + 0.3,
                            duration: 0.7,
                            ease: EASE_OUT_EXPO,
                          }}
                        >
                          <h2
                            className="text-[32px] sm:text-[40px] font-bold leading-[0.85]"
                            style={{
                              color: "#fff",
                              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                            }}
                          >
                            {mockupData.groomName}
                          </h2>
                          <p
                            className="text-xl sm:text-2xl my-1.5"
                            style={{
                              color: "#c9a961",
                              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                              fontWeight: 300,
                              fontStyle: "italic",
                            }}
                          >
                            &amp;
                          </p>
                          <h2
                            className="text-[32px] sm:text-[40px] font-bold leading-[0.85]"
                            style={{
                              color: "#fff",
                              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                            }}
                          >
                            {mockupData.brideName}
                          </h2>
                        </motion.div>

                        {/* Divider */}
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                          transition={{
                            delay: T.phoneParts + 0.6,
                            duration: 0.6,
                            ease: EASE_OUT_EXPO,
                          }}
                          className="mx-auto mt-5 sm:mt-6 w-16 h-px origin-center"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, #c9a961, transparent)",
                          }}
                        />

                        {/* Date + venue */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : {}}
                          transition={{
                            delay: T.phoneParts + 0.8,
                            duration: 0.5,
                          }}
                          className="mt-4 sm:mt-5 space-y-1.5"
                        >
                          <p
                            className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            {mockupData.date}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <MapPin
                              size={8}
                              style={{ color: "rgba(255,255,255,0.35)" }}
                            />
                            <p
                              className="text-[8px] sm:text-[9px] tracking-wide"
                              style={{ color: "rgba(255,255,255,0.35)" }}
                            >
                              {mockupData.venue}
                            </p>
                          </div>
                        </motion.div>

                        {/* Open invitation button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{
                            delay: T.phoneParts + 1,
                            duration: 0.5,
                          }}
                          className="mt-6 sm:mt-8"
                        >
                          <div
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide uppercase"
                            style={{
                              color: "#c9a961",
                              border: "1px solid rgba(201,169,97,0.3)",
                              background: "rgba(201,169,97,0.06)",
                            }}
                          >
                            Buka Undangan
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Bottom home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-24 h-1 rounded-full bg-white/20" />
                  </div>
                </div>

                {/* Reflection under phone */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-[50%] blur-md"
                  style={{
                    background:
                      "radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #fafaf9)",
        }}
      />
    </section>
  );
}
