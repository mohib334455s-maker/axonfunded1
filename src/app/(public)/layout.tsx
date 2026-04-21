import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FooterTradingStrip from "@/components/layout/FooterTradingStrip";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <FooterTradingStrip />
      <Footer />
    </>
  );
}
