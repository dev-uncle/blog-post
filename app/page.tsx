import { Navbar } from "@/features/landing/components/Navbar";
import { Hero } from "@/features/landing/components/Hero";
import { FeaturedPosts } from "@/features/landing/components/FeaturedPosts";
import { About } from "@/features/landing/components/About";
import { Newsletter } from "@/features/landing/components/Newsletter";
import { Footer } from "@/features/landing/components/Footer";

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
