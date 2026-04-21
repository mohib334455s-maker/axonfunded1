import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Vazirmatn, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Persian / Arabic font for RTL mode
const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://axonfunded.com"),
  title: {
    default: "Axon Funded — The First Ever Daily payout prop",
    template: "%s | Axon Funded",
  },
  description:
    "Two-phase proprietary trading evaluation with transparent rules, disciplined drawdown limits, and profit-sharing terms per your agreement — simulated trading environment.",
  keywords: [
    "prop trading",
    "funded trader",
    "trading challenge",
    "FTMO alternative",
    "prop firm",
    "forex funded account",
    "proprietary trading",
  ],
  authors: [{ name: "Axon Funded" }],
  creator: "Axon Funded",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Axon Funded",
  },
  openGraph: {
    title: "Axon Funded — The First Ever Daily payout prop",
    description:
      "Plan A prop evaluation: seven tiers $10K–$1M, two-phase rules (8%/4%), 12% max drawdown, 90% split, transparent `/rules` — for qualified traders.",
    type: "website",
    url: "https://axonfunded.com",
    siteName: "Axon Funded",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Axon Funded — The First Ever Daily payout prop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axon Funded — The First Ever Daily payout prop",
    description: "Axon Funded — transparent evaluation, disciplined risk rules, rapid payouts.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${vazirmatn.variable} ${notoSansArabic.variable}`}
    >
      <head />
      <body className="bg-background text-white antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
