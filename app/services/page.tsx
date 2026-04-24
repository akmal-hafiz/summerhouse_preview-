import Navbar from "@/components/common/Navbar";
import Services from "@/components/home/Services";
import Footer from "@/components/common/Footer";

export default function ServicesPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden bg-[#FAFAF9]">
      <Navbar alwaysSolid={true} />
      <main className="flex-1 w-full">
        <Services />
      </main>
      <Footer />
    </div>
  );
}
