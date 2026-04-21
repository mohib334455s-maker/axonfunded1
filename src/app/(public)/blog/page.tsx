import type { Metadata } from "next";
import BlogPageContent from "@/components/blog/BlogPageContent";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Learn prop trading strategies, risk management, and market analysis. Free articles for Axon Funded traders.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
