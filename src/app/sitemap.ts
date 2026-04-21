import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://axonfunded.com";
  const now = new Date();

  const blogSlugs = [
    "how-to-pass-prop-trading-challenge",
    "risk-management-secrets",
    "forex-sessions-best-times-trade",
    "trading-psychology-funded-account",
    "position-sizing-calculator-guide",
    "best-currency-pairs-prop-trading",
  ];

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/challenge`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/rules`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/affiliate`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/risk-disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...blogSlugs.map((slug) => ({
      url: `${base}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
