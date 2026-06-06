"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Star,
  MousePointerClick,
  Zap,
  Heart,
  Check,
  Music,
  Images,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

const COUPLE_PHOTO =
  "/uploads/c13e2da0-d952-471c-b411-302bbfa0d71b-1780155627570.jpg";
const PROMO_END = new Date("2026-08-31T23:59:59");

function useDaysLeft(target: Date) {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const calc = () =>
      setDays(
        Math.max(0, Math.floor((target.getTime() - Date.now()) / 86400000)),
      );
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [target]);
  return days;
}

// ─── Floating Interactive Cards ──────────────────────────────────────────
const FEATURE_CARDS = [
  {
    delay: 0.8,
    side: "left",
    top: "15%",
    icon: Check,
    iconColor: "#10b981",
    bgGradient: "from-emerald-500/10 to-green-500/5",
    title: "RSVP Confirmed",
    value: "+12",
    subtitle: "baru saja",
    x: -60,
  },
  {
    delay: 1.0,
    side: "left",
    top: "55%",
    icon: Heart,
    iconColor: "#ec4899",
    bgGradient: "from-pink-500/10 to-rose-500/5",
    title: "Ucapan Hangat",
    value: "284",
    subtitle: "ucapan masuk",
    x: -60,
  },
  {
    delay: 1.2,
    side: "right",
    top: "25%",
    icon: MousePointerClick,
    iconColor: "#8b5cf6",
    bgGradient: "from-purple-500/10 to-violet-500/5",
    title: "Views Hari Ini",
    value: "1.2K",
    subtitle: "pengunjung aktif",
    x: 60,
  },
  {
    delay: 1.4,
    side: "right",
    top: "65%",
    icon: Zap,
    iconColor: "#f59e0b",
    bgGradient: "from-amber-500/10 to-yellow-500/5",
    title: "Load Speed",
    value: "0.8s",
    subtitle: "super cepat",
    x: 60,
  },
];

// ─── 3D Floating Element ──────────────────────────────────────────
function FloatingOrb({
  delay = 0,
  size = 100,
  gradient,
}: {
  delay?: number;
  size?: number;
  gradient: string;
}) {
  const orbRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const orbX = useSpring(mouseX, springConfig);
  const orbY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (e.clientX - centerX) / 25;
      const distanceY = (e.clientY - centerY) / 25;
      mouseX.set(distanceX);
      mouseY.set(distanceY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={orbRef}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      style={{ x: orbX, y: orbY }}
      className="absolute pointer-events-none"
    >
      <div
        className={`rounded-full blur-3xl ${gradient}`}
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}

export default function HeroSection() {
  const daysLeft = useDaysLeft(PROMO_END);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animated number counter
  const [activeUsers, setActiveUsers] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const target = 128;
      const increment = target / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setActiveUsers(target);
          clearInterval(interval);
        } else {
          setActiveUsers(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-stone-50"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Animated Background Orbs (3D Parallax) ── */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY, opacity }}>
        <FloatingOrb
          delay={0.2}
          size={400}
          gradient="bg-gradient-to-br from-rose-200/40 to-pink-100/20"
        />
        <div className="absolute top-1/4 left-1/4">
          <FloatingOrb
            delay={0.4}
            size={300}
            gradient="bg-gradient-to-br from-amber-200/30 to-orange-100/15"
          />
        </div>
        <div className="absolute bottom-1/4 right-1/4">
          <FloatingOrb
            delay={0.6}
            size={350}
            gradient="bg-gradient-to-br from-emerald-200/25 to-teal-100/15"
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </motion.div>

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          {/* ── Left: Premium Copy ── */}
          <div className="max-w-2xl">
            {/* 🎯 Promo Badge dengan Glassmorphism - Compact */}
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10 rounded-full border px-3 py-1.5 sm:px-5 sm:py-3 backdrop-blur-xl text-[10px] sm:text-xs"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                borderColor: "rgba(212,175,55,0.3)",
                boxShadow:
                  "0 8px 32px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="flex items-center justify-center w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Sparkles size={10} className="sm:hidden text-white" />
                <Sparkles size={14} className="hidden sm:block text-white" />
              </div>
              <span className="text-secondary font-medium">
                Promo Launching
              </span>
              <div className="h-3 sm:h-4 w-px bg-stone-300" />
              <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Rp 129K
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50 border border-orange-200">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-caption font-semibold text-orange-700">
                  {daysLeft} hari lagi
                </span>
              </div>
            </motion.div>

            {/* 🎯 Headline - POWER STATEMENT */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif text-display-lg text-primary"
            >
              <span className="block">Undangan digital</span>
              <span className="relative inline-block mt-2">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #f4d03f 100%)",
                  }}
                >
                  yang bikin tamu kagum
                </span>
                {/* Animated underline */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 rounded-full origin-left"
                  style={{ transformOrigin: "left" }}
                />
              </span>
              <span className="block mt-2">sejak klik pertama</span>
            </motion.h1>

            {/* 🎯 Subheadline dengan better readability */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-7 text-body-lg text-secondary max-w-xl text-no-orphan"
            >
              Tamu klik link → musik langsung mengalir → nama mereka muncul →
              foto kalian tersaji cantik.
              <span className="text-primary font-semibold">
                {" "}
                Terpukau sejak detik pertama
              </span>
              , tanpa ribet scroll atau cari tombol.
            </motion.p>

            {/* 🎯 Stats Bar - Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex items-center gap-6 flex-wrap"
            >
              {/* Avatars dengan better design */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {["🤵🏻", "👰🏻", "🤵🏽", "👰🏽", "🤵🏿"].map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.6 + i * 0.08,
                        type: "spring",
                        stiffness: 300,
                      }}
                      className="w-10 h-10 rounded-full border-3 border-white bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center shadow-lg"
                      style={{ zIndex: 5 - i }}
                    >
                      <span className="text-lg">{e}</span>
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          delay: 1 + i * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400 drop-shadow-sm"
                        />
                      </motion.div>
                    ))}
                    <span className="text-button-base font-bold text-primary ml-1">
                      4.9
                    </span>
                  </div>
                  <p className="text-caption text-tertiary font-medium">
                    dari <strong className="text-secondary">500+</strong>{" "}
                    pasangan
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-stone-300 to-transparent" />

              {/* Active users counter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                </div>
                <div>
                  <p className="text-h5 font-bold text-primary leading-none">
                    {activeUsers}
                  </p>
                  <p className="text-caption-sm text-tertiary">sedang online</p>
                </div>
              </div>
            </motion.div>

            {/* 🎯 CTA Buttons - Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/templates" className="group">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full sm:w-auto px-8 py-4 rounded-2xl text-white text-button-lg overflow-hidden shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a3320 0%, #2d5a3d 50%, #1a3320 100%)",
                  }}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #2d5a3d 0%, #3d6f4d 100%)",
                    }}
                  />

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    }}
                  />

                  <span className="relative flex items-center justify-center gap-2">
                    Mulai Buat Undangan
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </motion.button>
              </Link>

              <Link href="/demo/modern-white" className="group">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-button-lg backdrop-blur-xl border-2 transition-all text-stone-700"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
                    borderColor: "rgba(120,113,108,0.2)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Play
                        size={11}
                        className="fill-white text-white ml-0.5"
                      />
                    </div>
                    Lihat Demo Live
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* 🎯 Feature Pills - Modern Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-5 sm:mt-8 flex flex-wrap gap-2 sm:gap-2.5"
            >
              {[
                { Icon: Music, text: "Musik auto-play", color: "from-purple-500 to-pink-500" },
                { Icon: Sparkles, text: "Nama tamu personal", color: "from-amber-500 to-orange-500" },
                { Icon: Images, text: "Galeri unlimited", color: "from-blue-500 to-cyan-500" },
                { Icon: CheckCircle2, text: "RSVP realtime", color: "from-green-500 to-emerald-500" },
                { Icon: MessageCircle, text: "Ucapan langsung", color: "from-gold-500 to-champagne-500" },
              ].map(({ Icon, text, color }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.9 + i * 0.08,
                    type: "spring",
                    stiffness: 150,
                  }}
                  className="group relative"
                >
                  <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200/50 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br ${color} p-1 flex items-center justify-center shadow-sm`}>
                      <Icon className="w-full h-full text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] sm:text-sm font-medium text-stone-700">
                      {text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Enhanced Phone Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end perspective-1000 mt-12 lg:mt-0"
          >
            <div
              className="relative select-none"
              style={{ transformStyle: "preserve-3d", isolation: "isolate" }}
            >
              {/* Enhanced glow */}
              <div className="absolute -inset-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-radial from-amber-200/40 via-transparent to-transparent blur-3xl" />
                <div className="absolute inset-0 bg-gradient-radial from-rose-200/30 via-transparent to-transparent blur-3xl animate-pulse" />
              </div>

              {/* Floating feature cards - Glassmorphism */}
              {FEATURE_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: card.side === "left" ? -20 : 20,
                    scale: 0.9,
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    delay: card.delay,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className={`absolute z-20 ${card.bgGradient} backdrop-blur-xl rounded-xl p-2.5 border border-white/20 hidden xl:block`}
                  style={{
                    [card.side === "left" ? "left" : "right"]: "-5px",
                    top: card.top,
                    transform: `translateX(${card.side === "left" ? "-100%" : "100%"})`,
                    background: "rgba(255,255,255,0.98)",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                    maxWidth: 140,
                    willChange: "transform",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${card.iconColor}15, ${card.iconColor}05)`,
                        border: `1px solid ${card.iconColor}20`,
                      }}
                    >
                      <card.icon size={14} style={{ color: card.iconColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-primary leading-tight mb-0.5">
                        {card.title}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p
                          className="text-sm font-bold leading-none"
                          style={{ color: card.iconColor }}
                        >
                          {card.value}
                        </p>
                        <p className="text-[9px] text-muted truncate">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Premium Phone Mockup */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotateY: [0, 2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
                style={{
                  width: 280,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* iPhone 15 Pro Max style */}
                <div
                  className="relative rounded-[52px] overflow-hidden"
                  style={{
                    padding: 12,
                    background:
                      "linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 50%, #0a0a0a 100%)",
                    boxShadow: `
                      0 50px 100px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.05),
                      inset 0 0 0 1.5px rgba(255,255,255,0.1),
                      inset 0 2px 4px rgba(255,255,255,0.15)
                    `,
                  }}
                >
                  {/* Dynamic Island */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full"
                    style={{
                      top: 15,
                      width: 95,
                      height: 26,
                      backgroundColor: "#000",
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1)",
                    }}
                  />

                  {/* Screen */}
                  <div
                    className="rounded-[42px] overflow-hidden bg-black relative"
                    style={{ aspectRatio: "9/19.5" }}
                  >
                    {/* Placeholder background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-pink-800 to-purple-900" />

                    <Image
                      src={COUPLE_PHOTO}
                      alt="Preview undangan pernikahan digital"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 280px, 320px"
                      quality={85}
                      priority
                      onError={(e) => {
                        // Hide image on error, show gradient background
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />

                    {/* Premium overlay gradient */}
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        background: `
                          linear-gradient(180deg,
                            rgba(0,0,0,0.6) 0%,
                            rgba(0,0,0,0) 25%,
                            rgba(0,0,0,0.05) 50%,
                            rgba(0,0,0,0.3) 75%,
                            rgba(0,0,0,0.9) 100%)
                        `,
                      }}
                    />

                    {/* Status bar - iOS 18 style */}
                    <div className="absolute top-0 inset-x-0 h-11 flex items-end justify-between px-7 pb-2 z-20">
                      <span className="text-caption-sm font-semibold text-white/80">
                        9:41
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-end gap-0.5">
                          {[4, 5, 6, 5, 6].map((h, i) => (
                            <div
                              key={i}
                              style={{
                                width: 2.5,
                                height: h,
                                borderRadius: 1,
                                backgroundColor: "rgba(255,255,255,0.7)",
                              }}
                            />
                          ))}
                        </div>
                        <div className="ml-1.5 w-5 h-2.5 rounded-sm border border-white/60 flex items-center px-0.5 relative">
                          <div
                            className="h-full rounded-sm bg-white/90"
                            style={{ width: "75%" }}
                          />
                          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-white/60 rounded-r-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Label */}
                    <p
                      className="absolute z-20 inset-x-0 text-center text-white/60 text-eyebrow font-medium"
                      style={{ top: 52 }}
                    >
                      Undangan Pernikahan
                    </p>

                    {/* Couple names - Enhanced */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-5">
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="font-serif italic text-white text-center leading-none drop-shadow-2xl text-display-md"
                        style={{ textShadow: "0 4px 24px rgba(0,0,0,1)" }}
                      >
                        Ikhwal
                      </motion.p>

                      <div className="flex items-center gap-5 my-4">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.7, duration: 0.5 }}
                          style={{
                            width: 40,
                            height: 1,
                            background:
                              "linear-gradient(90deg, transparent, #d4af37, transparent)",
                          }}
                        />
                        <motion.p
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 1.8,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className="font-serif text-h3"
                          style={{
                            color: "#d4af37",
                            textShadow: "0 2px 12px rgba(212,175,55,0.8)",
                          }}
                        >
                          &amp;
                        </motion.p>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.7, duration: 0.5 }}
                          style={{
                            width: 40,
                            height: 1,
                            background:
                              "linear-gradient(90deg, transparent, #d4af37, transparent)",
                          }}
                        />
                      </div>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.9, duration: 0.8 }}
                        className="font-serif italic text-white text-center leading-none drop-shadow-2xl text-display-md"
                        style={{ textShadow: "0 4px 24px rgba(0,0,0,1)" }}
                      >
                        Fani
                      </motion.p>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.1, duration: 0.6 }}
                        className="mt-4 text-white/70 text-eyebrow font-medium"
                      >
                        Sabtu · 12 April 2026
                      </motion.p>
                    </div>

                    {/* Bottom section - Enhanced */}
                    <div className="absolute bottom-0 inset-x-0 z-20 px-6 pb-7">
                      <div className="text-center mb-4">
                        <p className="text-white/50 text-caption-sm tracking-wider mb-1">
                          Kepada Yth.
                        </p>
                        <p
                          className="text-white text-caption font-semibold"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                        >
                          Bapak Andi dan Keluarga
                        </p>
                      </div>

                      {/* CTA Button - Glassmorphism */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 rounded-full text-white text-button-sm tracking-widest uppercase backdrop-blur-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
                          border: "1px solid rgba(255,255,255,0.3)",
                          boxShadow:
                            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                        }}
                      >
                        Buka Undangan
                      </motion.button>

                      {/* Progress indicator */}
                      <div
                        className="mt-3 mx-auto relative overflow-hidden rounded-full"
                        style={{
                          width: 56,
                          height: 2,
                          backgroundColor: "rgba(255,255,255,0.2)",
                        }}
                      >
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, #d4af37, #f4d03f)",
                          }}
                          animate={{ width: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced reflection */}
                <div
                  className="absolute inset-x-3 -bottom-4 h-12 rounded-b-3xl opacity-25 blur-xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
                    transform: "scaleY(-1) translateY(-100%)",
                    filter: "blur(20px)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Bottom gradient fade ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(248,250,252,0.9))",
        }}
      />
    </section>
  );
}
