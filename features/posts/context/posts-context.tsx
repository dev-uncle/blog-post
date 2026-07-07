"use client"

import * as React from "react"
import { createPostAction, editPostAction, deletePostAction } from "@/app/actions/posts"

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
}

export interface PostsContextType {
  posts: Post[]
  createPost: (postData: Omit<Post, "id" | "date" | "readTime">) => Promise<boolean>
  editPost: (id: string, postData: Omit<Post, "id" | "date" | "readTime">) => Promise<boolean>
  deletePost: (id: string) => Promise<boolean>
}

const PostsContext = React.createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children, initialPosts = [] }: { children: React.ReactNode; initialPosts?: Post[] }) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts)

  React.useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      setPosts(initialPosts)
    }
  }, [initialPosts])

  const createPost = async (postData: Omit<Post, "id" | "date" | "readTime">): Promise<boolean> => {
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
        return true
      }
      return false
    } catch (e) {
      console.error("Create post action failed:", e)
      return false
    }
  }

  const editPost = async (id: string, postData: Omit<Post, "id" | "date" | "readTime">): Promise<boolean> => {
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
        return true
      }
      return false
    } catch (e) {
      console.error("Edit post action failed:", e)
      return false
    }
  }

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const res = await deletePostAction(id)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        return true
      }
      return false
    } catch (e) {
      console.error("Delete post action failed:", e)
      return false
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
