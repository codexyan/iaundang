"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

const MOSAIC_IMAGES = [
  { src: "/images/templates/traditional.jpg", alt: "Template undangan tradisional" },
  { src: "/images/templates/wedding-bg.jpg", alt: "Template undangan pernikahan" },
  { src: "/images/templates/modern.jpg", alt: "Template undangan modern" },
  { src: "/images/templates/casual.jpg", alt: "Template undangan casual" },
  { src: "/images/templates/traditional.jpg", alt: "Template undangan elegan" },
  { src: "/images/templates/wedding-bg.jpg", alt: "Template undangan premium" },
];

export default function HeroSection({
  content,
}: {
  content?: HeroContent;
  mockup?: { groomName?: string; brideName?: string; date?: string; venue?: string };
}) {
  const hero = {
    ctaPrimary: content?.ctaPrimary ?? "Mulai Sekarang",
    ctaSecondary: content?.ctaSecondary ?? "Lihat Demo",
    subheadline:
      content?.subheadline ??
      "Setiap tamu menerima undangan dengan namanya sendiri. Musik mengalun saat dibuka, RSVP langsung dari HP, tanpa install apapun.",
  };

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "5%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-carbon" style={{ minHeight: "100svh" }}>
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-page mx-auto px-5 sm:px-8 pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-ash bg-chalk/[0.06] border border-chalk/[0.08] px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-chalk/40" />
                Undangan Digital Premium
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="mt-8 text-chalk font-semibold leading-[1.08] tracking-[-0.05em]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 48px)" }}
            >
              Undangan digital
              <br />
              yang elegan &amp; personal
              <br />
              untuk setiap tamu.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              className="mt-5 text-[15px] sm:text-base leading-[1.7] text-concrete max-w-[440px]"
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href="/templates">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-button bg-chalk text-graphite text-[14px] font-medium transition-colors hover:bg-mist"
                >
                  {hero.ctaPrimary}
                </motion.span>
              </Link>
              <Link href="/demo/renderer?id=javanese-gold">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 text-[14px] font-medium text-chalk/60 hover:text-chalk transition-colors"
                >
                  {hero.ctaSecondary}
                  <ArrowRight size={15} />
                </motion.span>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              className="mt-6 text-[12px] text-concrete/60"
            >
              Gratis coba · Sekali bayar · Tanpa langganan
            </motion.p>
          </div>

          {/* Right: Staggered Image Mosaic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="hidden lg:block relative"
            style={{ height: 520 }}
          >
            {/* Column 1 */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="absolute left-0 top-[60px] w-[45%] space-y-4"
            >
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={MOSAIC_IMAGES[0].src}
                  alt={MOSAIC_IMAGES[0].alt}
                  fill
                  className="object-cover !relative"
                  sizes="220px"
                />
              </div>
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={MOSAIC_IMAGES[4].src}
                  alt={MOSAIC_IMAGES[4].alt}
                  fill
                  className="object-cover !relative"
                  sizes="220px"
                />
              </div>
            </motion.div>

            {/* Column 2 */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              className="absolute left-[48%] top-0 w-[40%] space-y-4"
            >
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={MOSAIC_IMAGES[1].src}
                  alt={MOSAIC_IMAGES[1].alt}
                  fill
                  className="object-cover !relative"
                  sizes="200px"
                />
              </div>
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={MOSAIC_IMAGES[2].src}
                  alt={MOSAIC_IMAGES[2].alt}
                  fill
                  className="object-cover !relative"
                  sizes="200px"
                />
              </div>
            </motion.div>

            {/* Column 3 (partial, peeking from edge) */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="absolute right-[-40px] top-[30px] w-[25%] space-y-4"
            >
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={MOSAIC_IMAGES[3].src}
                  alt={MOSAIC_IMAGES[3].alt}
                  fill
                  className="object-cover !relative"
                  sizes="140px"
                />
              </div>
              <div className="rounded-card overflow-hidden border border-chalk/[0.06]" style={{ aspectRatio: "4/5" }}>
                <Image
                  src={MOSAIC_IMAGES[5].src}
                  alt={MOSAIC_IMAGES[5].alt}
                  fill
                  className="object-cover !relative"
                  sizes="140px"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Mobile: horizontal scroll strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="lg:hidden flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide"
          >
            {MOSAIC_IMAGES.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="shrink-0 w-[140px] rounded-card overflow-hidden border border-chalk/[0.06]"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={140}
                  height={187}
                  className="object-cover w-full h-full"
                  sizes="140px"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
