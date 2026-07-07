import { Navbar } from "@/features/landing/components/Navbar";
import { Hero } from "@/features/landing/components/Hero";
import { FeaturedPosts } from "@/features/landing/components/FeaturedPosts";
import { About } from "@/features/landing/components/About";
import { Newsletter } from "@/features/landing/components/Newsletter";
import { Footer } from "@/features/landing/components/Footer";
import { getPosts } from "@/features/posts/actions/posts";
import { PostsProvider } from "@/features/posts/context/posts-context";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();

  return (
    <PostsProvider initialPosts={posts}>
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
    </PostsProvider>
  );
}
