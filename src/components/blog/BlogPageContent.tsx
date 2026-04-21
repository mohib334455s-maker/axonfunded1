"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Hash,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
  ArrowLeftRight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import BlogFloatingParticles from "@/components/page-ambient/BlogFloatingParticles";

const posts: {
  id: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  title: string;
  excerpt: string;
  icon: LucideIcon;
  featured: boolean;
}[] = [
  {
    id: "1",
    slug: "how-to-pass-prop-trading-challenge",
    category: "Strategy",
    readTime: "8 min",
    date: "Mar 14, 2024",
    title: "How to Pass a Prop Trading Challenge: Complete 2024 Guide",
    excerpt:
      "A step-by-step guide to passing your Phase 1 and Phase 2 evaluations. We cover risk management, consistency rules, and the psychology of trading under evaluation pressure.",
    icon: TrendingUp,
    featured: true,
  },
  {
    id: "2",
    slug: "risk-management-secrets",
    category: "Risk Management",
    readTime: "6 min",
    date: "Mar 10, 2024",
    title: "The 5 Risk Management Secrets Every Funded Trader Uses",
    excerpt:
      "Discover why the best traders don't focus on profits — they focus on not losing. These five rules will transform your trading performance.",
    icon: Shield,
    featured: false,
  },
  {
    id: "3",
    slug: "forex-sessions-best-times-trade",
    category: "Market Analysis",
    readTime: "5 min",
    date: "Mar 7, 2024",
    title: "London vs New York: The Best Sessions to Trade Forex",
    excerpt:
      "Not all market hours are created equal. Learn which sessions offer the best liquidity, tightest spreads, and highest win rates.",
    icon: Globe,
    featured: false,
  },
  {
    id: "4",
    slug: "trading-psychology-funded-account",
    category: "Psychology",
    readTime: "10 min",
    date: "Mar 3, 2024",
    title: "Trading Psychology: Why 80% of Traders Fail the Evaluation",
    excerpt:
      "The most common reason traders fail isn't their strategy — it's their psychology. We break down the mindset shifts required to trade a funded account.",
    icon: Lightbulb,
    featured: true,
  },
  {
    id: "5",
    slug: "position-sizing-calculator-guide",
    category: "Tools",
    readTime: "4 min",
    date: "Feb 28, 2024",
    title: "How to Use a Position Size Calculator (With Examples)",
    excerpt:
      "Never risk more than you should. This guide walks through position sizing with real trade examples using our built-in calculator.",
    icon: Hash,
    featured: false,
  },
  {
    id: "6",
    slug: "best-currency-pairs-prop-trading",
    category: "Strategy",
    readTime: "7 min",
    date: "Feb 25, 2024",
    title: "The 5 Best Currency Pairs for Prop Trading Challenges",
    excerpt:
      "Choosing the right instruments is half the battle. We analyze EUR/USD, GBP/USD, and three more pairs that consistently offer clean setups.",
    icon: ArrowLeftRight,
    featured: false,
  },
];

const categories = [
  "All",
  "Strategy",
  "Risk Management",
  "Psychology",
  "Market Analysis",
  "Tools",
] as const;

export default function BlogPageContent() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(() => {
    if (cat === "All") return posts;
    return posts.filter((p) => p.category === cat);
  }, [cat]);

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);

  return (
    <div className="mx-auto w-full min-w-0 max-w-full overflow-x-clip pt-20">
      <section className="relative overflow-hidden border-b border-white/5 bg-black px-4 py-24 text-center sm:px-6 sm:py-28">
        <BlogFloatingParticles />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gradient-to-r from-gold-500/12 via-white/[0.06] to-transparent px-4 py-2 shadow-[0_0_40px_-12px_rgba(212,175,55,0.45)] backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5 text-amber-200/95" strokeWidth={1.25} />
            <span className="text-sm font-medium text-amber-100/95">Axon Blog</span>
          </div>
          <h1 className="mb-6 text-balance text-4xl font-black tracking-tight text-white md:text-6xl">
            Learn to <span className="text-gold-gradient">Trade Better</span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-neutral-400">
            Strategy guides, risk frameworks, and market notes from the Axon desk — free for every trader.
          </p>
        </motion.div>
      </section>

      <section className="sticky top-16 z-20 border-b border-white/5 bg-[#060606]/90 py-4 backdrop-blur-xl md:top-20">
        <div className="mx-auto flex max-w-6xl flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                c === cat
                  ? "border-gold-500/40 bg-gold-500/15 text-amber-200 shadow-[0_0_24px_-8px_rgba(212,175,55,0.35)]"
                  : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {featured.length > 0 && (
            <>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
                    Editorial
                  </p>
                  <h2 className="text-2xl font-bold text-white md:text-3xl">Featured long reads</h2>
                </div>
                <Sparkles className="hidden h-8 w-8 text-gold-500/30 sm:block" strokeWidth={1.25} />
              </div>
              <div className="mb-16 grid gap-6 lg:grid-cols-12">
                {featured.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.06 }}
                    className={i === 0 ? "lg:col-span-7" : "lg:col-span-5"}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-[#080809] p-6 shadow-[0_32px_100px_-40px_rgba(0,0,0,0.85)] ring-1 ring-gold-500/[0.06] transition-all hover:border-gold-500/25 hover:ring-gold-500/15 sm:p-8"
                    >
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10 shadow-inner">
                          <post.icon className="h-7 w-7 text-amber-200/90" strokeWidth={1.25} />
                        </div>
                        <span className="rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-amber-200/95">
                          {post.category}
                        </span>
                      </div>
                      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.25} />
                        {post.readTime}
                        <span className="text-neutral-700">·</span>
                        {post.date}
                      </div>
                      <h3 className="mb-3 text-balance text-xl font-bold leading-snug text-white group-hover:text-amber-200/95 sm:text-2xl">
                        {post.title}
                      </h3>
                      <p className="mb-8 flex-1 text-pretty text-sm leading-relaxed text-neutral-400 sm:text-base">
                        {post.excerpt}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold-500">
                        Continue reading
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          strokeWidth={1.25}
                        />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-neutral-500">
              No articles in this category yet.
            </p>
          ) : (
            <>
              <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                {featured.length > 0 ? "More articles" : "Articles"}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regular.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-[#0a0a0c]/80 p-5 transition-all hover:border-gold-500/25 hover:bg-[#0c0c0f]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <post.icon className="h-5 w-5 text-amber-200/80" strokeWidth={1.25} />
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 font-medium text-neutral-400">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" strokeWidth={1.25} />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mb-4 flex-1 text-balance text-sm font-bold leading-snug text-white group-hover:text-amber-200/90">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-neutral-600">
                    <span>{post.date}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-gold-500/80 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.25}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-b from-[#0b0b0e] to-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient shadow-lg shadow-amber-900/20">
            <Zap className="h-6 w-6 fill-black text-black" strokeWidth={1.25} />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Weekly trading notes</h2>
          <p className="mb-8 text-sm text-neutral-400">
            One curated email — setups, risk reminders, and funded-trader stories. Unsubscribe anytime.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="you@email.com"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-gold-500/40 focus:outline-none sm:max-w-xs"
            />
            <button
              type="button"
              className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold shadow-[0_0_32px_-8px_rgba(212,175,55,0.4)]"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
