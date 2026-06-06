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
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
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
              className="mt-8 flex items-center gap-6 flex-wrap"
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
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/templates" className="group">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full sm:w-auto px-8 py-4 rounded-2xl text-white text-button-lg overflow-hidden shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #2c4a34 0%, #3a4e44 15%, #5d7a6a 40%, #8fa99a 65%, #b8954d 85%, #c9a961 100%)",
                  }}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #4a6355 0%, #6fa88a 35%, #b8954d 70%, #c9a961 100%)",
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
            className="flex justify-center lg:justify-end mt-12 lg:mt-0"
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
                className="relative"
                style={{ width: 280 }}
              >
                {/* iPhone frame */}
                <div
                  className="relative rounded-[52px] overflow-hidden"
                  style={{
                    padding: 12,
                    background:
                      "linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 50%, #0a0a0a 100%)",
                    boxShadow: `
                      0 50px 100px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.05),
                      inset 0 0 0 1.5px rgba(255,255,255,0.1)
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
                    }}
                  />

                  {/* Screen */}
                  <div
                    className="rounded-[42px] overflow-hidden bg-black relative"
                    style={{ aspectRatio: "9/19.5" }}
                  >
                    {/* Background Photo */}
                    <Image
                      src={COUPLE_PHOTO}
                      alt="Preview undangan"
                      fill
                      className="object-cover"
                      sizes="280px"
                      quality={95}
                      priority
                    />

                    {/* Elegant Overlay Gradient */}
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        background: `linear-gradient(180deg,
                          rgba(0,0,0,0.7) 0%,
                          rgba(0,0,0,0.4) 15%,
                          rgba(0,0,0,0.1) 35%,
                          rgba(0,0,0,0.1) 65%,
                          rgba(0,0,0,0.5) 85%,
                          rgba(0,0,0,0.9) 100%)`,
                      }}
                    />

                    {/* Elegant Invitation Cover Content */}
                    <div className="absolute inset-0 z-20 flex flex-col">
                      {/* Top Section - Greeting */}
                      <div className="flex-shrink-0 pt-16 px-6 text-center">
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                          className="font-serif text-gold-200 text-[10px] tracking-[0.3em] uppercase mb-3"
                        >
                          The Wedding Of
                        </motion.p>
                        <motion.h2
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.4 }}
                          className="font-serif text-white text-2xl leading-tight drop-shadow-2xl mb-1"
                        >
                          Rizky &amp; Aulia
                        </motion.h2>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.6, duration: 0.6 }}
                          className="w-16 h-px mx-auto"
                          style={{
                            background: "linear-gradient(90deg, transparent, #c9a961, transparent)"
                          }}
                        />
                      </div>

                      {/* Middle Section - Spacer */}
                      <div className="flex-1" />

                      {/* Bottom Section - Guest Name & CTA */}
                      <div className="flex-shrink-0 pb-8 px-5">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.8 }}
                          className="text-center mb-4"
                        >
                          <p className="text-white/70 text-[9px] tracking-[0.2em] uppercase mb-2.5">
                            Kepada Yth.
                          </p>
                          <div
                            className="px-4 py-2.5 rounded-xl backdrop-blur-md mx-auto inline-block"
                            style={{
                              background: "rgba(255,255,255,0.12)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            }}
                          >
                            <p className="text-white font-semibold text-sm">
                              Bapak Andi &amp; Keluarga
                            </p>
                          </div>
                        </motion.div>

                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.0 }}
                          className="w-full py-3 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #2c4a34 0%, #4a6355 50%, #c9a961 100%)",
                            boxShadow: "0 4px 20px rgba(201,169,97,0.4)",
                          }}
                        >
                          <span className="relative z-10">BUKA UNDANGAN</span>
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 z-0"
                            style={{
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                            }}
                          />
                        </motion.button>
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
