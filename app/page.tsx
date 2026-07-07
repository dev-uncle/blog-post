import { Navbar } from "@/components/pages/landing/Navbar";
import { Hero } from "@/components/pages/landing/Hero";
import { FeaturedPosts } from "@/components/pages/landing/FeaturedPosts";
import { About } from "@/components/pages/landing/About";
import { Newsletter } from "@/components/pages/landing/Newsletter";
import { Footer } from "@/components/pages/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedPosts />
        <About />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
