import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/app-build-manifest\.json$/],
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.dicebear.com"],
  },
  async redirects() {
    return [
      { source: "/education", destination: "/", permanent: false },
      { source: "/education/:path*", destination: "/", permanent: false },
      { source: "/admin/education", destination: "/admin", permanent: false },
      { source: "/admin/education/:path*", destination: "/admin", permanent: false },
      { source: "/dashboard/refer-earn", destination: "/dashboard/affiliate", permanent: false },
      { source: "/dashboard/transactions", destination: "/dashboard/payouts", permanent: false },
      { source: "/dashboard/accounts", destination: "/dashboard?tab=accounts", permanent: false },
      { source: "/dashboard/analytics", destination: "/dashboard?tab=analytics", permanent: false },
      { source: "/dashboard/metrics", destination: "/dashboard?tab=metrics", permanent: false },
      { source: "/dashboard/journal", destination: "/dashboard", permanent: false },
      { source: "/dashboard/competitions", destination: "/dashboard", permanent: false },
      { source: "/dashboard/infinity-points", destination: "/dashboard", permanent: false },
      { source: "/dashboard/tickets", destination: "/dashboard/support", permanent: false },
      { source: "/dashboard/faq", destination: "/dashboard/support", permanent: false },
      { source: "/dashboard/trading-rules", destination: "/rules", permanent: false },
    ];
  },
};

export default withPWA(nextConfig);
