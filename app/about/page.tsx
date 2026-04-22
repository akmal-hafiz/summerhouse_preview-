import Navbar from "@/components/common/Navbar";
import About from "@/components/about/About";
import Footer from "@/components/common/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#FAFAF9]">
      <Navbar alwaysSolid={true} />
      <main className="flex-1 w-full">
        <About />
      </main>
      <Footer />
    </div>
  );
}
