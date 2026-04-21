"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, TrendingUp } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import PyramidLogo from "@/components/ui/PyramidLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <PyramidLogo size="sm" animate={false} />
        </div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.06, duration: 0.3 }}
          className="mb-8"
        >
          <div className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, rgba(255,215,0,0.2) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-neutral-400 leading-relaxed mb-10 max-w-md mx-auto">
            Looks like this trade didn&apos;t go through. The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GoldButton href="/">
              <Home className="w-4 h-4" />
              Back to Homepage
            </GoldButton>
            <GoldButton href="/dashboard" variant="outline">
              <TrendingUp className="w-4 h-4" />
              Go to Dashboard
            </GoldButton>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {[
            { label: "Challenge Plans", href: "/challenge" },
            { label: "Trading Rules", href: "/rules" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <Link key={link.label} href={link.href}
              className="text-sm text-neutral-600 hover:text-gold-500 transition-colors">
              {link.label}
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
