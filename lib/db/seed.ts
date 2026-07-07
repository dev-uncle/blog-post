import { db } from "./index";
import { users, posts } from "./schema";
import { eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEFAULT_POSTS = [
  {
    title: "Mastering Tailwind CSS v4: What's New & How to Upgrade",
    excerpt:
      "An in-depth guide to Tailwind CSS v4's CSS-native architecture, performance enhancements, and simplified theme settings.",
    content:
      "Tailwind CSS v4 is a major rewrite that leverages a CSS-native compilation process. It compiles up to 10x faster, reduces config boilerplate, and supports direct imports in your stylesheet. In this guide, we dive deep into how the new engine operates, including `@theme` directives, performance benchmarks, and a step-by-step walkthrough of upgrading your existing project from v3 to v4. We cover key breaking changes, manual migration tips, and setting up customized colors and fonts using purely CSS variables.",
    category: "Development",
    readTime: "5 min read",
  },
  {
    title: "Architecting React 19 Apps with Next.js App Router",
    excerpt:
      "Best practices for utilizing Server Components, Server Actions, Suspense patterns, and optimization strategies for React 19 projects.",
    content:
      "React 19 brings exciting features like Action hooks (`useActionState`, `useFormStatus`), native document metadata support, asset loading, and server action refinements. Building with Next.js App Router allows developers to take full advantage of these updates. This article explores modular file routing, designing optimized Suspense boundaries, streaming content gracefully, and securing server-side action endpoints. We also look at common pitfalls to avoid when mixing client-side interactive elements and server components.",
    category: "Architecture",
    readTime: "8 min read",
  },
  {
    title: "Designing Fluid User Experiences with CSS Transitions",
    excerpt:
      "How to implement motion principles, hover states, and smooth layouts that guide user attention without compromising accessibility.",
    content:
      "Motion design isn't just about looks—it is a critical part of user interaction. When done right, transitions feel subtle, natural, and reduce cognitive load. This publication breaks down the core principles of easing curves (ease-in-out, cubic-bezier), hardware acceleration for translations, and the visual impact of hover behaviors. We demonstrate how to build custom menu toggles, modal animations, and card reveals that feel extremely premium while ensuring they remain screen-reader friendly and respect user motion preferences.",
    category: "Design",
    readTime: "6 min read",
  },
];

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(
      `Seed query failed. Retrying in ${delay}ms... (${retries} retries left)`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function seedDemoData() {
  try {
    const demoEmail = "demo@devscribbles.com";

    // 1. Check if demo user exists
    let [demoUser] = await withRetry(() =>
      db.select().from(users).where(eq(users.email, demoEmail)).limit(1),
    );

    if (!demoUser) {
      console.log("Seeding demo user into Neon DB...");
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("password123", salt);
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=Demo%20Creator`;

      [demoUser] = await db
        .insert(users)
        .values({
          name: "Demo Creator",
          email: demoEmail,
          passwordHash,
          avatar,
        })
        .returning();
      console.log("Seeding demo user completed successfully.");
    }

    // 2. Check if posts exist for the demo user
    const [demoPost] = await withRetry(() =>
      db
        .select()
        .from(posts)
        .where(eq(posts.authorId, demoUser.id))
        .limit(1)
    );

    if (!demoPost) {
      // Find default posts with null authorId to claim/assign to the demo user
      const existingNullAuthorPosts = await withRetry(() =>
        db
          .select()
          .from(posts)
          .where(isNull(posts.authorId))
      );

      if (existingNullAuthorPosts.length > 0) {
        console.log(`Assigning ${existingNullAuthorPosts.length} unowned posts to the demo user...`);
        await db
          .update(posts)
          .set({ authorId: demoUser.id })
          .where(isNull(posts.authorId));
        console.log("Assignment completed.");
      } else {
        console.log("Seeding default posts for demo user into Neon DB...");
        await db.insert(posts).values(
          DEFAULT_POSTS.map((p) => ({
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            category: p.category,
            readTime: p.readTime,
            authorId: demoUser.id,
          }))
        );
        console.log("Seeding default posts completed successfully.");
      }
    }

    // 3. Update the default posts with relative distributed dates so date range filters are dynamic
    const now = new Date();
    const datesMap: Record<string, Date> = {
      "Mastering Tailwind CSS v4: What's New & How to Upgrade": now,
      "Architecting React 19 Apps with Next.js App Router": new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      "Designing Fluid User Experiences with CSS Transitions": new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    };

    console.log("Updating publication dates for filter demo...");
    for (const [title, date] of Object.entries(datesMap)) {
      try {
        await withRetry(() =>
          db
            .update(posts)
            .set({ createdAt: date })
            .where(eq(posts.title, title))
        );
      } catch (err) {
        console.error(`Failed to update publication date for "${title}":`, err);
      }
    }
    console.log("Publication dates updated successfully.");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
