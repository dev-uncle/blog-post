"use server"

import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { seedDemoData } from "@/lib/db/seed";

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface PostResponse {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  coverImage?: string | null;
  authorId?: string | null;
  authorName?: string | null;
}

function calculateReadTime(text: string): string {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  return `${minutes} min read`;
}

function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Database query failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function getPosts(): Promise<PostResponse[]> {
  try {
    await seedDemoData();

    const results = await withRetry(() =>
      db
        .select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          content: posts.content,
          category: posts.category,
          coverImage: posts.coverImage,
          authorId: posts.authorId,
          readTime: posts.readTime,
          createdAt: posts.createdAt,
          authorName: users.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .orderBy(desc(posts.createdAt))
    );

    return results.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      date: formatPostDate(p.createdAt),
      readTime: p.readTime,
      coverImage: p.coverImage,
      authorId: p.authorId,
      authorName: p.authorName,
    }));
  } catch (error) {
    console.error("Error in getPosts server action:", error);
    return [];
  }
}

export async function getPostById(id: string): Promise<PostResponse | null> {
  try {
    const [result] = await withRetry(() =>
      db
        .select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          content: posts.content,
          category: posts.category,
          coverImage: posts.coverImage,
          authorId: posts.authorId,
          readTime: posts.readTime,
          createdAt: posts.createdAt,
          authorName: users.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, id))
        .limit(1)
    );

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      excerpt: result.excerpt,
      content: result.content,
      category: result.category,
      date: formatPostDate(result.createdAt),
      readTime: result.readTime,
      coverImage: result.coverImage,
      authorId: result.authorId,
      authorName: result.authorName,
    };
  } catch (error) {
    console.error(`Error in getPostById (${id}):`, error);
    return null;
  }
}

export async function createPostAction(postData: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string;
}): Promise<ActionResponse<PostResponse>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in to create a publication." };
    }

    const readTime = calculateReadTime(postData.content);

    const [newPost] = await withRetry(() =>
      db
        .insert(posts)
        .values({
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          category: postData.category,
          coverImage: postData.coverImage || null,
          authorId: session.userId,
          readTime,
        })
        .returning()
    );

    revalidatePath("/");
    revalidatePath("/posts");

    return {
      success: true,
      data: {
        id: newPost.id,
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        category: newPost.category,
        date: formatPostDate(newPost.createdAt),
        readTime: newPost.readTime,
        coverImage: newPost.coverImage,
        authorId: newPost.authorId,
        authorName: session.name,
      },
    };
  } catch (error) {
    console.error("Create post action error:", error);
    return { success: false, error: "Failed to create publication." };
  }
}

export async function editPostAction(
  id: string,
  postData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverImage?: string;
  }
): Promise<ActionResponse<PostResponse>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in to edit publications." };
    }

    // Verify post exists and user is owner
    const [existingPost] = await withRetry(() =>
      db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)
    );

    if (!existingPost) {
      return { success: false, error: "Publication not found." };
    }

    // We allow editing if it is a default post (authorId is null) or if the user is the author
    if (existingPost.authorId !== null && existingPost.authorId !== session.userId) {
      return { success: false, error: "You are not authorized to edit this publication." };
    }

    const readTime = calculateReadTime(postData.content);

    const [updatedPost] = await withRetry(() =>
      db
        .update(posts)
        .set({
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          category: postData.category,
          coverImage: postData.coverImage || null,
          readTime,
          // If editing a default post, assign it to the user who edited it
          authorId: existingPost.authorId || session.userId,
        })
        .where(eq(posts.id, id))
        .returning()
    );

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);

    return {
      success: true,
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        category: updatedPost.category,
        date: formatPostDate(updatedPost.createdAt),
        readTime: updatedPost.readTime,
        coverImage: updatedPost.coverImage,
        authorId: updatedPost.authorId,
        authorName: session.name,
      },
    };
  } catch (error) {
    console.error("Edit post action error:", error);
    return { success: false, error: "Failed to update publication." };
  }
}

export async function deletePostAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in to delete publications." };
    }

    // Verify post exists and user is owner
    const [existingPost] = await withRetry(() =>
      db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)
    );

    if (!existingPost) {
      return { success: false, error: "Publication not found." };
    }

    if (existingPost.authorId !== null && existingPost.authorId !== session.userId) {
      return { success: false, error: "You are not authorized to delete this publication." };
    }

    await withRetry(() => db.delete(posts).where(eq(posts.id, id)));

    revalidatePath("/");
    revalidatePath("/posts");

    return { success: true };
  } catch (error) {
    console.error("Delete post action error:", error);
    return { success: false, error: "Failed to delete publication." };
  }
}
