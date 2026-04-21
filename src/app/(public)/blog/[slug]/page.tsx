import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Calendar, Tag, ArrowRight, BookOpen,
  TrendingUp, Shield, Globe, Lightbulb, Hash, ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

const posts: Record<string, {
  slug: string; title: string; category: string; readTime: string; date: string;
  excerpt: string; icon: LucideIcon;
  content: { type: "h2" | "h3" | "p" | "ul" | "tip" | "warning"; text: string | string[] }[];
  relatedSlugs: string[];
}> = {
  "how-to-pass-prop-trading-challenge": {
    slug: "how-to-pass-prop-trading-challenge", category: "Strategy", readTime: "8 min", date: "Mar 14, 2024", icon: TrendingUp,
    title: "How to Pass a Prop Trading Challenge: Complete 2024 Guide",
    excerpt: "A step-by-step guide to passing your Phase 1 and Phase 2 evaluations.",
    relatedSlugs: ["risk-management-secrets", "trading-psychology-funded-account"],
    content: [
      { type: "p", text: "Passing a prop trading challenge is not about being lucky or having a magic strategy. It's about demonstrating consistent, disciplined risk management over a defined period. This guide breaks down every step you need to take to pass Phase 1 and Phase 2 of the Axon Funded evaluation." },
      { type: "h2", text: "Understanding the Evaluation Structure" },
      { type: "p", text: "Before you place a single trade, you need to fully understand what the evaluation is testing. The challenge has two phases, each with a profit target, maximum daily drawdown limit, and maximum overall drawdown limit." },
      { type: "ul", text: ["Phase 1: 8% profit target, 5% max daily drawdown, 12% static max overall drawdown, minimum 5 trading days", "Phase 2: 5% profit target, 5% max daily drawdown, 12% static max overall drawdown, minimum 5 trading days", "Funded: No profit target, 5% max daily drawdown, 12% static max overall drawdown"] },
      { type: "h2", text: "Step 1: Trade Like You're Already Funded" },
      { type: "p", text: "The biggest mistake evaluation traders make is treating the challenge as a sprint. They overtrade, take excessive risk, and burn through their drawdown in the first few days. This is backwards thinking." },
      { type: "p", text: "Instead, behave as if you're already funded from day one. What does that mean? It means following your proven strategy, not over-leveraging, and not chasing losses. Consistency is the signal the evaluation is designed to measure." },
      { type: "tip", text: "Set your daily risk limit to 1–1.5% of account size. This leaves you buffer even on your worst days while keeping you well within the 5% daily drawdown limit." },
      { type: "h2", text: "Step 2: Master Your Risk Management" },
      { type: "p", text: "Risk management is not just about stop losses. It's about total daily exposure, position sizing per trade, correlation between open trades, and knowing when to stop for the day." },
      { type: "ul", text: ["Risk 0.5–1% per individual trade", "Limit correlated currency exposure (e.g., don't have 3 long USD trades at once)", "Stop trading for the day if you've lost 2% — recover the next day", "Use the position size calculator to avoid emotional sizing"] },
      { type: "h2", text: "Step 3: Have a Well-Defined Strategy" },
      { type: "p", text: "You don't need a perfect strategy — you need a consistently executed one. Pick a strategy you've backtested and forward-tested on your own account. Know your average win rate, risk/reward ratio, and expected drawdown profile." },
      { type: "warning", text: "Avoid switching strategies mid-challenge. If your current approach isn't working in this market condition, reduce size and wait for better setups rather than abandoning your plan entirely." },
      { type: "h2", text: "Step 4: Track Everything" },
      { type: "p", text: "Use the Axon Funded Trading Journal to log every trade. Record your setup, entry rationale, exit reason, emotional state, and post-trade review. Patterns will emerge that help you identify what's working and what's hurting you." },
      { type: "h2", text: "Step 5: Manage the Psychological Pressure" },
      { type: "p", text: "Evaluation pressure is real. When money is on the line (even a challenge fee), your psychology changes. You start second-guessing entries, cutting winners too early, and letting losers run hoping they'll recover." },
      { type: "p", text: "The antidote is process focus. Execute your strategy, not your P&L. If you followed your rules, a loss is not a failure. A win from breaking your rules is not a success." },
      { type: "h2", text: "Final Thoughts" },
      { type: "p", text: "The traders who pass evaluations consistently are not the ones with the best indicators or the most complex strategies. They are the ones who treat risk management as their primary job and profit as the natural outcome of doing that job well." },
    ],
  },
  "risk-management-secrets": {
    slug: "risk-management-secrets", category: "Risk Management", readTime: "6 min", date: "Mar 10, 2024", icon: Shield,
    title: "The 5 Risk Management Secrets Every Funded Trader Uses",
    excerpt: "Discover why the best traders don't focus on profits — they focus on not losing.",
    relatedSlugs: ["how-to-pass-prop-trading-challenge", "position-sizing-calculator-guide"],
    content: [
      { type: "p", text: "Ask any consistently profitable funded trader what their edge is and they'll tell you: risk management. Not their entry system, not their indicator setup, not their time frame. Risk management. Here are the five principles they live by." },
      { type: "h2", text: "Secret 1: The 1% Rule Is Not a Suggestion" },
      { type: "p", text: "Risking 1% or less per trade is the foundation. At 1% risk, you can lose 10 consecutive trades and still have 90% of your capital. At 5% risk per trade, 10 consecutive losses wipes out 40% of your account. The math is not on your side with higher risk per trade." },
      { type: "tip", text: "Risk 0.5–1% per trade. On a $100K account, that's $500–$1,000 maximum risk per position." },
      { type: "h2", text: "Secret 2: Know Your Daily Limit Before You Trade" },
      { type: "p", text: "Every morning, funded traders set a mental (or actual) daily loss limit before opening their platform. If they hit it — typically 1.5–2% — they close the platform and return the next day. This prevents the compounding disaster of a bad day turning into a catastrophic one." },
      { type: "h2", text: "Secret 3: Correlation Is Invisible Leverage" },
      { type: "p", text: "Opening 3 long trades on EUR/USD, GBP/USD, and EUR/GBP looks like three separate trades. But they are all highly correlated to EUR strength. If EUR sells off, all three lose simultaneously. True diversification means understanding currency correlations." },
      { type: "ul", text: ["EUR/USD and GBP/USD: 70–85% correlation", "USD/CAD and crude oil: inverse correlation", "Gold and USD: generally inverse correlation"] },
      { type: "h2", text: "Secret 4: Take Partial Profits" },
      { type: "p", text: "Many funded traders move their stop to break-even once a trade reaches 1R profit, then take 50% of the position off at 2R. This guarantees the trade cannot become a loser and locks in profit, while still allowing the remaining 50% to run to higher targets." },
      { type: "h2", text: "Secret 5: Your Win Rate Does Not Matter As Much As Your R/R" },
      { type: "p", text: "A 40% win rate with a 3:1 risk/reward ratio is more profitable than a 65% win rate with a 1:1 ratio. Focus on finding high quality setups with genuine asymmetric reward potential rather than maximizing the number of winning trades." },
    ],
  },
  "forex-sessions-best-times-trade": {
    slug: "forex-sessions-best-times-trade", category: "Market Analysis", readTime: "5 min", date: "Mar 7, 2024", icon: Globe,
    title: "London vs New York: The Best Sessions to Trade Forex",
    excerpt: "Not all market hours are created equal. Learn which sessions offer the best liquidity, tightest spreads, and highest win rates.",
    relatedSlugs: ["best-currency-pairs-prop-trading", "risk-management-secrets"],
    content: [
      { type: "p", text: "The forex market is open 24 hours a day, 5 days a week. But not all hours are equal. Liquidity, spread, volatility, and trend quality vary dramatically across the four main trading sessions." },
      { type: "h2", text: "The Four Sessions" },
      { type: "ul", text: ["Sydney Session: 9 PM – 6 AM UTC. Low volatility, good for ranging markets", "Tokyo Session: 12 AM – 9 AM UTC. Active JPY pairs, moderate liquidity", "London Session: 7 AM – 4 PM UTC. Highest volume, tightest spreads, strongest trends", "New York Session: 12 PM – 9 PM UTC. High volume, especially during overlap with London"] },
      { type: "h2", text: "The London–New York Overlap: Prime Time" },
      { type: "p", text: "The best time to trade is the overlap between London and New York sessions (12 PM – 4 PM UTC). During this window, both major financial centers are active simultaneously, resulting in the highest daily volume, tightest bid/ask spreads, and the most decisive price moves of the day." },
      { type: "tip", text: "If you can only trade one window, make it 12:00–16:00 UTC. This is when the majority of the day's trends establish and most breakouts confirm." },
      { type: "h2", text: "Best Pairs by Session" },
      { type: "ul", text: ["London: EUR/USD, GBP/USD, EUR/GBP — most liquid, cleanest technicals", "New York: USD/CAD, USD/CHF, USD/JPY — driven by US economic data", "Tokyo: USD/JPY, AUD/JPY, NZD/JPY — JPY pairs most active", "Avoid: Any pair during its 'dead zone' (the session where neither counterpart currency's center is active)"] },
    ],
  },
  "trading-psychology-funded-account": {
    slug: "trading-psychology-funded-account", category: "Psychology", readTime: "10 min", date: "Mar 3, 2024", icon: Lightbulb,
    title: "Trading Psychology: Why 80% of Traders Fail the Evaluation",
    excerpt: "The most common reason traders fail isn't their strategy — it's their psychology.",
    relatedSlugs: ["how-to-pass-prop-trading-challenge", "risk-management-secrets"],
    content: [
      { type: "p", text: "We analyze thousands of failed evaluation accounts. The data is clear: the most common cause of failure is not a bad strategy. It's a good strategy executed poorly because of psychology. Here's what's really happening and how to fix it." },
      { type: "h2", text: "The Evaluation Mindset Trap" },
      { type: "p", text: "The moment you're in an evaluation, your brain knows there's something at stake. This activates your threat response. Suddenly, normal market noise looks like risk. Normal drawdown feels catastrophic. Normal losing streaks feel like personal failure." },
      { type: "warning", text: "If you find yourself checking your account balance more than 10 times per day, you're in the evaluation mindset trap. Your brain is in threat mode, not performance mode." },
      { type: "h2", text: "The 5 Psychological Failure Modes" },
      { type: "ul", text: ["Revenge trading: Taking impulsive trades to 'recover' a loss, ignoring your setup criteria", "Overtrading: Taking low-quality setups because you 'need' to hit the profit target faster", "Premature profit-taking: Cutting winners too early because you're afraid they'll turn into losers", "Analysis paralysis: Being so afraid to lose that you miss your best setups", "Tilt: Emotional decision-making after 2+ consecutive losses"] },
      { type: "h2", text: "Building a Pre-Trade Routine" },
      { type: "p", text: "The best-performing traders have a pre-trade routine that anchors them in process rather than outcome. Before opening their platform, they review their strategy rules, set their daily risk limit, and remind themselves of their edge over a large sample of trades." },
      { type: "tip", text: "Write your three non-negotiable rules on a physical card and stick it to your monitor. When in doubt, refer to the card. Rules written down are harder to break than rules kept in your head." },
      { type: "h2", text: "The Journaling Practice That Changes Everything" },
      { type: "p", text: "Keeping a detailed trading journal is the single highest-ROI activity for psychological improvement. Not just trade data — include your emotional state before, during, and after each trade. Patterns become obvious quickly. Most traders discover they break rules primarily after a winning trade (overconfidence) or after a loss (revenge)." },
    ],
  },
  "position-sizing-calculator-guide": {
    slug: "position-sizing-calculator-guide", category: "Tools", readTime: "4 min", date: "Feb 28, 2024", icon: Hash,
    title: "How to Use a Position Size Calculator (With Examples)",
    excerpt: "Never risk more than you should. This guide walks through position sizing with real trade examples.",
    relatedSlugs: ["risk-management-secrets", "best-currency-pairs-prop-trading"],
    content: [
      { type: "p", text: "Position sizing is one of the most underrated aspects of trading. Using the correct lot size on every trade is the difference between surviving a drawdown and blowing an account. Here's how to use our calculator correctly." },
      { type: "h2", text: "The Core Formula" },
      { type: "p", text: "Lot Size = (Account Balance × Risk%) ÷ (Stop Loss in Pips × Pip Value)" },
      { type: "h2", text: "Example: EUR/USD Trade" },
      { type: "ul", text: ["Account: $50,000", "Risk per trade: 1% = $500", "Stop loss: 25 pips", "Pip value for 1 standard lot EUR/USD: $10", "Calculation: $500 ÷ (25 × $10) = $500 ÷ $250 = 2 lots"] },
      { type: "tip", text: "Use the Axon Funded Risk Calculator in your dashboard — it handles pip values automatically for all 15 supported instruments. Just input your account size, risk percentage, and stop loss in pips." },
      { type: "h2", text: "Why This Matters for Prop Challenges" },
      { type: "p", text: "With a 5% max daily drawdown limit, if you take 5 trades in a day all risking 1%, one very bad session (all 5 lose) costs you exactly 5% — right at the daily limit. Oversized risk stacks intraday against the daily cap; the separate 12% static maximum drawdown is measured from initial balance across the lifecycle of the account." },
      { type: "warning", text: "Always use the position size calculator before entering a trade, not after. Sizing a trade 'by feel' is how most accounts get closed prematurely." },
    ],
  },
  "best-currency-pairs-prop-trading": {
    slug: "best-currency-pairs-prop-trading", category: "Strategy", readTime: "7 min", date: "Feb 25, 2024", icon: ArrowLeftRight,
    title: "The 5 Best Currency Pairs for Prop Trading Challenges",
    excerpt: "Choosing the right instruments is half the battle.",
    relatedSlugs: ["forex-sessions-best-times-trade", "how-to-pass-prop-trading-challenge"],
    content: [
      { type: "p", text: "Not all currency pairs are created equal for prop trading challenges. The best pairs combine high liquidity (tight spreads), clear technical structure, and predictable behavior around key levels. Here are the top five." },
      { type: "h2", text: "1. EUR/USD — The King" },
      { type: "p", text: "The world's most traded currency pair. Tight 0.1–0.5 pip spreads, excellent technical structure, and high liquidity during London and New York sessions. The pair respects technical levels better than almost any other instrument. Recommended for: all experience levels." },
      { type: "h2", text: "2. GBP/USD — The Mover" },
      { type: "p", text: "Higher volatility than EUR/USD means bigger moves but also wider stops required. GBP/USD can move 100–200 pips on UK economic data. The volatility is a feature, not a bug — it offers excellent risk/reward setups for patient traders. Recommended for: intermediate+ traders." },
      { type: "h2", text: "3. USD/JPY — The Trend Follower" },
      { type: "p", text: "When it trends, it trends hard. USD/JPY is known for sustained directional moves, especially during risk-on/risk-off events. Strong correlation with US equity markets and US Treasury yields. Excellent for traders who use macro themes. Recommended for: traders who follow fundamental catalysts." },
      { type: "h2", text: "4. Gold (XAU/USD) — The Volatility Pair" },
      { type: "p", text: "Gold offers 20–40 pip moves in single candlesticks during volatile periods, which means large R multiples are achievable. However, spreads are wider and position sizing must account for the $1 per pip per 0.01 lot value. Recommended for: swing traders with wider stops." },
      { type: "h2", text: "5. USD/CAD — The Data Pair" },
      { type: "p", text: "Highly reactive to US Non-Farm Payrolls, Canadian employment data, and crude oil prices. Creates excellent news-driven setups during North American session. Moderate volatility with decent liquidity. Recommended for: traders who trade news events." },
      { type: "tip", text: "Focus on mastering 1–2 pairs before expanding. The best traders in the world trade fewer instruments, not more." },
    ],
  },
};

const allPosts = Object.values(posts);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Article Not Found" };
  return { title: post.title, description: post.excerpt };
}

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const related = post.relatedSlugs.map((s) => allPosts.find((p) => p.slug === s)).filter(Boolean);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gold-500/30 bg-gold-500/10 text-gold-500">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Clock className="w-3 h-3" />{post.readTime} read
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />{post.date}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-neutral-400 leading-relaxed">{post.excerpt}</p>
        </div>

        {/* Icon banner */}
        <div className="w-full h-40 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex items-center justify-center mb-10">
          <post.icon className="w-20 h-20 text-gold-500/60" strokeWidth={1} />
        </div>

        {/* Content */}
        <article className="prose-custom">
          {post.content.map((block, i) => {
            if (block.type === "h2") return <h2 key={i} className="text-xl font-bold text-white mt-10 mb-4">{block.text as string}</h2>;
            if (block.type === "h3") return <h3 key={i} className="text-base font-bold text-white mt-8 mb-3">{block.text as string}</h3>;
            if (block.type === "p") return <p key={i} className="text-neutral-400 leading-relaxed mb-5">{block.text as string}</p>;
            if (block.type === "ul") return (
              <ul key={i} className="space-y-2 mb-6">
                {(block.text as string[]).map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            );
            if (block.type === "tip") return (
              <div key={i} className="my-6 p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 flex gap-3">
                <Tag className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-300 leading-relaxed">{block.text as string}</p>
              </div>
            );
            if (block.type === "warning") return (
              <div key={i} className="my-6 p-4 rounded-xl border border-danger/20 bg-danger/5 flex gap-3">
                <span className="text-danger text-sm font-bold flex-shrink-0">⚠</span>
                <p className="text-sm text-neutral-300 leading-relaxed">{block.text as string}</p>
              </div>
            );
            return null;
          })}
        </article>

        {/* Divider */}
        <div className="border-t border-white/8 my-12" />

        {/* Related */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-gold-500" />
              <h3 className="text-base font-bold text-white">Related Articles</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => r && (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-surface hover:border-gold-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                    <r.icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gold-500 mb-1">{r.category}</p>
                    <h4 className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors line-clamp-2">{r.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{r.readTime}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-gold-500 transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 text-center">
          <p className="text-sm font-semibold text-white mb-1">Ready to put this into practice?</p>
          <p className="text-xs text-neutral-400 mb-4">Start your evaluation and get funded in as little as 2 weeks.</p>
          <Link href="/challenge" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            Start a Challenge <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
