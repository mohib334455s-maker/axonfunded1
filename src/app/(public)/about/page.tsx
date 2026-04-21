import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Axon Funded — mission, values, team, and commitment to traders worldwide.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
