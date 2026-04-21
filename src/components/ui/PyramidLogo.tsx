"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PyramidLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
  /** Short tagline under “FUNDED” (e.g. site slogan). Hidden on very small screens to save header height. */
  tagline?: string;
  animate?: boolean;
  /** When false, renders icon only without wrapping in Link (e.g. hero decoration). */
  linkable?: boolean;
}

export default function PyramidLogo({
  size = "md",
  href = "/",
  showText = true,
  tagline,
  animate = true,
  linkable = true,
}: PyramidLogoProps) {
  const dims = {
    sm: { icon: 28, wrap: "gap-2",   axon: "text-[15px]", funded: "text-[13px]" },
    md: { icon: 36, wrap: "gap-2.5", axon: "text-[19px]", funded: "text-[16px]" },
    lg: { icon: 48, wrap: "gap-3",   axon: "text-[26px]", funded: "text-[22px]" },
  };
  const { icon, wrap, axon, funded } = dims[size];

  const logoContent = (
    <div className={`flex items-center ${wrap}`}>
      {/* Pyramid Icon */}
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.6, rotateY: -90 } : undefined}
        animate={animate ? { opacity: 1, scale: 1, rotateY: 0 } : undefined}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex-shrink-0"
        style={{ perspective: "600px" }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_3px_14px_rgba(255,215,0,0.5)]"
        >
          <defs>
            <linearGradient id="plg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FFF8DC" />
              <stop offset="25%"  stopColor="#FFD700" />
              <stop offset="60%"  stopColor="#DAA520" />
              <stop offset="100%" stopColor="#9A6A00" />
            </linearGradient>
            <linearGradient id="pls" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stopColor="rgba(255,255,255,0.55)" />
              <stop offset="60%" stopColor="rgba(255,215,0,0.2)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
            <linearGradient id="plr" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stopColor="#FFE57F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B8860B" stopOpacity="0.1" />
            </linearGradient>
            <filter id="ps">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
            <filter id="pg">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFD700" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Main pyramid face */}
          <motion.path
            d="M 24 5 L 43 43 L 5 43 Z"
            fill="url(#plg)"
            filter="url(#ps)"
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.15 }}
          />
          {/* Left face (shadow depth) */}
          <motion.path
            d="M 24 5 L 5 43 L 24 31 Z"
            fill="url(#pls)"
            opacity="0.65"
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 0.65 } : undefined}
            transition={{ duration: 0.6, delay: 0.25 }}
          />
          {/* Right face highlight */}
          <motion.path
            d="M 24 5 L 43 43 L 24 31 Z"
            fill="url(#plr)"
            opacity="0.3"
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 0.3 } : undefined}
            transition={{ duration: 0.6, delay: 0.35 }}
          />
          {/* Ridge line */}
          <motion.line
            x1="24" y1="7" x2="24" y2="31"
            stroke="#B8860B" strokeWidth="1.5" opacity="0.6"
            initial={animate ? { pathLength: 0 } : undefined}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.6 }}
          />
          {/* Inner glow orb */}
          <motion.circle cx="24" cy="20" r="9" fill="url(#pls)" opacity="0.2" filter="url(#pg)"
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 0.2 } : undefined}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </svg>

        {/* Pulsing ambient glow */}
        {animate && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,215,0,0.45), transparent 70%)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Brand text */}
      {showText && (
        <motion.div
          initial={animate ? { opacity: 0, x: -10 } : undefined}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="leading-none"
        >
          {/* AXON — 3D Polished Gold */}
          <span
            className={`block font-black tracking-tight ${axon}`}
            style={{
              background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 30%, #DAA520 60%, #B8860B 80%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 1px 4px rgba(255,215,0,0.5))",
            }}
          >
            AXON
          </span>
          {/* FUNDED — Brushed Chrome Silver */}
          <span
            className={`block font-black tracking-[0.06em] -mt-0.5 ${funded}`}
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 20%, #C0C0C0 45%, #A0A0A0 65%, #C8C8C8 85%, #FFFFFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 1px 3px rgba(192,192,192,0.4))",
            }}
          >
            FUNDED
          </span>
          {tagline ? (
            <span
              className="mt-1 hidden min-[380px]:block max-w-[200px] sm:max-w-[240px] md:max-w-[280px] truncate text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400/85"
              title={tagline}
            >
              {tagline}
            </span>
          ) : null}
        </motion.div>
      )}
    </div>
  );

  if (linkable && href) {
    return (
      <Link href={href} className="inline-block group">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {logoContent}
        </motion.div>
      </Link>
    );
  }

  return <div className="inline-block">{logoContent}</div>;
}
