import Navbar from "@/components/common/Navbar";
import About from "@/components/about/About";
import Footer from "@/components/common/Footer";
import editorialStyles from "@/components/about/AboutEditorialSections.module.css";

export const metadata = {
  title: "About Summerhouses",
  description: "Discover the story, values, and curated Bali hospitality behind Summerhouses private villa stays.",
};

export default function AboutPage() {
  return (
    <div className={editorialStyles.aboutPageShell}>
      <Navbar alwaysSolid={true} />
      <main className={editorialStyles.aboutPageMain}>
        <About />
      </main>
      <Footer />
    </div>
  );
}
