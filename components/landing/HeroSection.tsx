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
  Star,
  Heart,
  Check,
} from "lucide-react";

const COUPLE_PHOTO = "/logos/foto-mockup.png"; // User's uploaded mockup photo

// ─── Subtle Floating Indicators (Minimal & Clean) ────────
const SUBTLE_INDICATORS = [
  {
    delay: 1.2,
    position: { top: "18%", right: "-12%" },
    icon: Check,
    value: "+12",
    label: "RSVP",
    color: "#2c4a34",
  },
  {
    delay: 1.4,
    position: { bottom: "25%", right: "-10%" },
    icon: Heart,
    value: "284",
    label: "Wishes",
    color: "#c9a961",
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
          gradient="bg-gradient-to-br from-forest-200/30 to-forest-100/15"
        />
        <div className="absolute top-1/4 left-1/4">
          <FloatingOrb
            delay={0.4}
            size={300}
            gradient="bg-gradient-to-br from-gold-200/25 to-gold-100/15"
          />
        </div>
        <div className="absolute bottom-1/4 right-1/4">
          <FloatingOrb
            delay={0.6}
            size={350}
            gradient="bg-gradient-to-br from-warmGold-200/20 to-warmGold-100/10"
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </motion.div>

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-12 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* ── Left: Premium Copy ── */}
          <div className="max-w-2xl">
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
                      "linear-gradient(135deg, #2c4a34 0%, #3a4e44 15%, #5d7a6a 30%, #8fa99a 50%, #b8954d 75%, #c9a961 100%)",
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
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full origin-left"
                  style={{
                    transformOrigin: "left",
                    background: "linear-gradient(90deg, #2c4a34 0%, #4a6355 25%, #8fa99a 50%, #b8954d 75%, #c9a961 100%)"
                  }}
                />
              </span>
              <span className="block mt-2">sejak klik pertama</span>
            </motion.h1>

            {/* 🎯 Subheadline */}
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
              className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-6 flex-wrap"
            >
              {/* Avatars */}
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
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center shadow-lg"
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
                          className="fill-gold-500 text-gold-500 drop-shadow-sm"
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

              {/* Active users */}
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

            {/* 🎯 CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link href="/templates" className="group">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white text-button-lg overflow-hidden shadow-2xl shadow-forest-300/30"
                  style={{
                    background:
                      "linear-gradient(135deg, #2c4a34 0%, #3a5a40 50%, #4a6355 100%)",
                  }}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #3a5a40 0%, #4a6355 50%, #5d7a6a 100%)",
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
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-button-lg backdrop-blur-xl border-2 transition-all text-stone-700"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
                    borderColor: "rgba(120,113,108,0.2)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-logo-gradient flex items-center justify-center">
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
          </div>

          {/* ── Right: Elegant Phone Mockup with Invitation Cover ── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end mt-4 sm:mt-12 lg:mt-0"
          >
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute -inset-16 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-radial from-gold-200/30 via-transparent to-transparent blur-3xl" />
              </div>

              {/* Subtle floating indicators */}
              {SUBTLE_INDICATORS.map((indicator, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: indicator.delay,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="absolute z-20 hidden xl:block"
                  style={indicator.position}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md bg-white/95 border shadow-lg"
                    style={{ borderColor: `${indicator.color}20` }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${indicator.color}15` }}
                    >
                      <indicator.icon size={14} style={{ color: indicator.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: indicator.color }}>
                        {indicator.value}
                      </p>
                      <p className="text-[10px] text-stone-500">{indicator.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Premium Phone Mockup */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-[220px] sm:w-[280px]"
              >
                {/* iPhone frame — slim bezel */}
                <div
                  className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden"
                  style={{
                    padding: 4,
                    background:
                      "linear-gradient(145deg, #1c1c1e 0%, #111 50%, #000 100%)",
                    boxShadow: `
                      0 40px 80px rgba(0,0,0,0.35),
                      inset 0 0 0 0.5px rgba(255,255,255,0.12)
                    `,
                  }}
                >
                  {/* Dynamic Island */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full"
                    style={{
                      top: 6,
                      width: 60,
                      height: 16,
                      backgroundColor: "#000",
                    }}
                  />

                  {/* Screen */}
                  <div
                    className="rounded-[21px] sm:rounded-[25px] overflow-hidden relative"
                    style={{ aspectRatio: "9/19.5", backgroundColor: '#0f2d0f' }}
                  >
                    {/* Dark wedding photo — natural vignette */}
                    <Image
                      src="/images/templates/wedding-bg.jpg"
                      alt="Preview undangan"
                      fill
                      className="object-cover"
                      sizes="280px"
                      quality={95}
                      priority
                      style={{ opacity: 0.45 }}
                    />

                    {/* Heavy dark scrim — guarantees text readability */}
                    <div className="absolute inset-0 z-[2]" style={{ backgroundColor: 'rgba(10,20,10,0.65)' }} />

                    {/* Bottom solid gradient — text zone */}
                    <div className="absolute inset-x-0 bottom-0 z-[3]" style={{
                      height: '65%',
                      background: 'linear-gradient(to top, rgba(10,20,10,0.98) 0%, rgba(10,20,10,0.85) 40%, transparent 100%)',
                    }} />

                    {/* Content — minimal, premium feel */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      <div className="text-center px-5">
                        {/* The Wedding of */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2, duration: 0.6 }}
                          className="text-[10px] sm:text-xs tracking-[0.35em] uppercase mb-5 sm:mb-6"
                          style={{ color: '#d4af37', fontWeight: 500 }}
                        >
                          The Wedding of
                        </motion.p>

                        {/* Couple names — big and centered */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5, duration: 0.6 }}
                        >
                          <h2 className="text-4xl sm:text-5xl font-bold leading-[0.9]" style={{
                            color: '#fff', fontFamily: "'Playfair Display', serif",
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          }}>
                            Rizky
                          </h2>
                          <p className="text-2xl sm:text-3xl my-1" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif", fontWeight: 300, fontStyle: 'italic' }}>&amp;</p>
                          <h2 className="text-4xl sm:text-5xl font-bold leading-[0.9]" style={{
                            color: '#fff', fontFamily: "'Playfair Display', serif",
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          }}>
                            Aulia
                          </h2>
                        </motion.div>

                        {/* Date */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.9, duration: 0.5 }}
                          className="text-[9px] sm:text-[11px] tracking-[0.2em] uppercase mt-5 sm:mt-6"
                          style={{ color: 'rgba(255,255,255,0.6)' }}
                        >
                          12 · 04 · 2026
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>
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
