"use client"

import * as React from "react"
import { createPostAction, editPostAction, deletePostAction } from "@/features/posts/actions/posts"

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  coverImage?: string | null
  authorId?: string | null
  authorName?: string | null
  commentCount?: number
}

export interface PostsContextType {
  posts: Post[]
  createPost: (postData: Omit<Post, "id" | "date" | "readTime" | "commentCount">) => Promise<{ success: boolean; error?: string }>
  editPost: (id: string, postData: Omit<Post, "id" | "date" | "readTime" | "commentCount">) => Promise<{ success: boolean; error?: string }>
  deletePost: (id: string) => Promise<{ success: boolean; error?: string }>
}

const PostsContext = React.createContext<PostsContextType | undefined>(undefined)

const EMPTY_POSTS: Post[] = []

export function PostsProvider({ children, initialPosts = EMPTY_POSTS }: { children: React.ReactNode; initialPosts?: Post[] }) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts)
  const [prevInitialPosts, setPrevInitialPosts] = React.useState<Post[]>(initialPosts)

  if (initialPosts !== prevInitialPosts) {
    setPosts(initialPosts)
    setPrevInitialPosts(initialPosts)
  }

  const createPost = async (postData: Omit<Post, "id" | "date" | "readTime" | "commentCount">): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await createPostAction({
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        category: postData.category,
        coverImage: postData.coverImage || undefined,
      })
      if (res.success && res.data) {
        const newPost = res.data
        setPosts((prev) => [newPost, ...prev])
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to create publication." }
    } catch (e) {
      console.error("Create post action failed:", e)
      return { success: false, error: e instanceof Error ? e.message : "Failed to create publication." }
    }
  }

  const editPost = async (id: string, postData: Omit<Post, "id" | "date" | "readTime" | "commentCount">): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await editPostAction(id, {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        category: postData.category,
        coverImage: postData.coverImage || undefined,
      })
      if (res.success && res.data) {
        const updatedPost = res.data
        setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)))
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to update publication." }
    } catch (e) {
      console.error("Edit post action failed:", e)
      return { success: false, error: e instanceof Error ? e.message : "Failed to update publication." }
    }
  }

  const deletePost = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await deletePostAction(id)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to delete publication." }
    } catch (e) {
      console.error("Delete post action failed:", e)
      return { success: false, error: e instanceof Error ? e.message : "Failed to delete publication." }
    }
  }

  return (
    <PostsContext.Provider value={{ posts, createPost, editPost, deletePost }}>
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = React.useContext(PostsContext)
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
}
