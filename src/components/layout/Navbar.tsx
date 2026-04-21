"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import PyramidLogo from "@/components/ui/PyramidLogo";
import { useCommonDict } from "@/hooks/useCommonDict";

export default function Navbar() {
  const { dict } = useCommonDict();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = useMemo(
    () =>
      [
        { label: dict.nav.home, href: "/" },
        { label: dict.nav.challenge, href: "/challenge" },
        { label: dict.nav.rules, href: "/rules" },
        { label: dict.nav.leaderboard, href: "/leaderboard" },
        { label: dict.nav.affiliate, href: "/affiliate" },
      ] as const,
    [dict.nav]
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-nav" : "border-b border-white/8 bg-[#14141f]/92 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Pyramid Logo */}
          <PyramidLogo size="sm" animate={false} tagline={dict.nav.brandSlogan} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link px-4 py-2 rounded-lg ${
                  pathname === link.href
                    ? "active bg-gold-500/10"
                    : "hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="nav-link px-4 py-2 rounded-lg hover:bg-white/5">
              {dict.nav.dashboard}
            </Link>
            <GoldButton href="/challenge" size="sm">
              {dict.nav.startChallenge}
            </GoldButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 hover:border-gold-500/30 transition-colors"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? "text-gold-500 bg-gold-500/10 border border-gold-500/20"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-4 space-y-3"
              >
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  {dict.nav.dashboard}
                </Link>
                <GoldButton
                  fullWidth
                  onClick={() => {
                    setIsMobileOpen(false);
                    router.push("/challenge");
                  }}
                >
                  {dict.nav.startChallenge}
                </GoldButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
