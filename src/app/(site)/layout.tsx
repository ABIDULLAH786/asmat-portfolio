import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CustomCursor from "@/components/site/CustomCursor";
import PageLoader from "@/components/site/PageLoader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-cursor flex min-h-screen flex-col">
      <PageLoader />
      <CustomCursor />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
