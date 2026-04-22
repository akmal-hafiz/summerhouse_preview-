import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";
import Introduction from "@/components/home/Introduction";
import Footer from "@/components/common/Footer";
import VillaCollection from "@/components/home/VillaCollection";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden bg-[#FAFAF9]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Introduction />
        <VillaCollection />
      </main>
      <Footer />
    </div>
  );
}
