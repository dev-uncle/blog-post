"use server"

import { db } from "@/lib/db";
import { comments, posts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./posts";

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  body: string;
  createdAt: string;
}

function formatCommentDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

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
    console.warn(`DB query failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function getCommentsByPostId(postId: string): Promise<CommentResponse[]> {
  try {
    const results = await withRetry(() =>
      db
        .select({
          id: comments.id,
          postId: comments.postId,
          authorId: comments.authorId,
          authorName: users.name,
          authorAvatar: users.avatar,
          body: comments.body,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.postId, postId))
        .orderBy(desc(comments.createdAt))
    );

    return results.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorId: c.authorId,
      authorName: c.authorName ?? "Unknown",
      authorAvatar: c.authorAvatar,
      body: c.body,
      createdAt: formatCommentDate(c.createdAt),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function createCommentAction(
  postId: string,
  body: string
): Promise<ActionResponse<CommentResponse>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in to comment." };
    }

    const trimmed = body.trim();
    if (!trimmed) {
      return { success: false, error: "Comment cannot be empty." };
    }
    if (trimmed.length > 1000) {
      return { success: false, error: "Comment must be 1000 characters or less." };
    }

    const [newComment] = await withRetry(() =>
      db
        .insert(comments)
        .values({ postId, authorId: session.userId, body: trimmed })
        .returning()
    );

    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      data: {
        id: newComment.id,
        postId: newComment.postId,
        authorId: newComment.authorId,
        authorName: session.name,
        authorAvatar: session.avatar,
        body: newComment.body,
        createdAt: formatCommentDate(newComment.createdAt),
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Create comment error:", msg);
    return { success: false, error: `Failed to post comment: ${msg}` };
  }
}

export async function deleteCommentAction(
  commentId: string,
  postId: string
): Promise<ActionResponse> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in." };
    }

    const [existing] = await withRetry(() =>
      db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
    );

    if (!existing) {
      return { success: false, error: "Comment not found." };
    }

    if (existing.authorId !== session.userId) {
      return { success: false, error: "You are not authorized to delete this comment." };
    }

    await withRetry(() => db.delete(comments).where(eq(comments.id, commentId)));

    revalidatePath(`/posts/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: "Failed to delete comment." };
  }
}

/**
 * Users can edit their own comment ONLY if the post belongs to them.
 * Rule: comment.authorId === session.userId AND post.authorId === session.userId
 * NOTE: neon-http does not support concurrent queries — do them sequentially.
 */
export async function updateCommentAction(
  commentId: string,
  postId: string,
  body: string
): Promise<ActionResponse<CommentResponse>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "You must be logged in." };
    }

    const trimmed = body.trim();
    if (!trimmed) {
      return { success: false, error: "Comment cannot be empty." };
    }
    if (trimmed.length > 1000) {
      return { success: false, error: "Comment must be 1000 characters or less." };
    }

    // Sequential queries — neon-http does not support concurrent fetch
    const [existingComment] = await withRetry(() =>
      db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
    );

    if (!existingComment) {
      return { success: false, error: "Comment not found." };
    }

    // Must be the comment author
    if (existingComment.authorId !== session.userId) {
      return { success: false, error: "You can only edit your own comments." };
    }

    const [existingPost] = await withRetry(() =>
      db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    );

    if (!existingPost) {
      return { success: false, error: "Post not found." };
    }

    // Must also be the post author
    if (existingPost.authorId !== session.userId) {
      return { success: false, error: "You can only edit comments on your own posts." };
    }

    const [updated] = await withRetry(() =>
      db
        .update(comments)
        .set({ body: trimmed })
        .where(eq(comments.id, commentId))
        .returning()
    );

    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      data: {
        id: updated.id,
        postId: updated.postId,
        authorId: updated.authorId,
        authorName: session.name,
        authorAvatar: session.avatar,
        body: updated.body,
        createdAt: formatCommentDate(updated.createdAt),
      },
    };
  } catch (error) {
    console.error("Update comment error:", error);
    return { success: false, error: "Failed to update comment." };
  }
}
