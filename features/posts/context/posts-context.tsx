"use client"

import * as React from "react"

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  coverImage?: string // Base64 data URL
  gradientFrom?: string // Fallback gradient
  gradientTo?: string // Fallback gradient
}

const DEFAULT_POSTS: Post[] = [
  {
    id: "default-1",
    title: "Mastering Tailwind CSS v4: What's New & How to Upgrade",
    excerpt: "An in-depth guide to Tailwind CSS v4's CSS-native architecture, performance enhancements, and simplified theme settings.",
    content: "Tailwind CSS v4 is a major rewrite that leverages a CSS-native compilation process. It compiles up to 10x faster, reduces config boilerplate, and supports direct imports in your stylesheet. In this guide, we dive deep into how the new engine operates, including `@theme` directives, performance benchmarks, and a step-by-step walkthrough of upgrading your existing project from v3 to v4. We cover key breaking changes, manual migration tips, and setting up customized colors and fonts using purely CSS variables.",
    category: "Development",
    date: "Jul 06, 2026",
    readTime: "5 min read",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-indigo-600/20",
  },
  {
    id: "default-2",
    title: "Architecting React 19 Apps with Next.js App Router",
    excerpt: "Best practices for utilizing Server Components, Server Actions, Suspense patterns, and optimization strategies for React 19 projects.",
    content: "React 19 brings exciting features like Action hooks (`useActionState`, `useFormStatus`), native document metadata support, asset loading, and server action refinements. Building with Next.js App Router allows developers to take full advantage of these updates. This article explores modular file routing, designing optimized Suspense boundaries, streaming content gracefully, and securing server-side action endpoints. We also look at common pitfalls to avoid when mixing client-side interactive elements and server components.",
    category: "Architecture",
    date: "Jun 29, 2026",
    readTime: "8 min read",
    gradientFrom: "from-cyan-500/20",
    gradientTo: "to-blue-500/20",
  },
  {
    id: "default-3",
    title: "Designing Fluid User Experiences with CSS Transitions",
    excerpt: "How to implement motion principles, hover states, and smooth layouts that guide user attention without compromising accessibility.",
    content: "Motion design isn't just about looks—it is a critical part of user interaction. When done right, transitions feel subtle, natural, and reduce cognitive load. This publication breaks down the core principles of easing curves (ease-in-out, cubic-bezier), hardware acceleration for translations, and the visual impact of hover behaviors. We demonstrate how to build custom menu toggles, modal animations, and card reveals that feel extremely premium while ensuring they remain screen-reader friendly and respect user motion preferences.",
    category: "Design",
    date: "Jun 18, 2026",
    readTime: "6 min read",
    gradientFrom: "from-blue-600/20",
    gradientTo: "to-sky-400/20",
  },
]

export interface PostsContextType {
  posts: Post[]
  createPost: (postData: Omit<Post, "id" | "date" | "readTime">) => void
  editPost: (id: string, postData: Omit<Post, "id" | "date" | "readTime">) => void
  deletePost: (id: string) => void
}

const PostsContext = React.createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = React.useState<Post[]>([])

  // Reusable helper to assemble the list, filter deleted defaults, and set the state
  const updatePostsState = React.useCallback((customList: Post[], deletedDefaultIds: string[]) => {
    const activeDefaults = DEFAULT_POSTS.filter(post => !deletedDefaultIds.includes(post.id))
    setPosts([...customList, ...activeDefaults])
  }, [])

  React.useEffect(() => {
    const storedPosts = localStorage.getItem("scribbles_custom_posts")
    const storedDeletedDefaults = localStorage.getItem("scribbles_deleted_defaults")
    
    const timer = setTimeout(() => {
      let customPosts: Post[] = []
      let deletedDefaultIds: string[] = []
      let updatedNeeded = false

      if (storedPosts) {
        try {
          const parsedList = JSON.parse(storedPosts)
          if (Array.isArray(parsedList)) {
            // Self-heal: ensure older posts from previous runs have a unique, persistent ID in localStorage
            customPosts = parsedList.map((post: Partial<Post>, idx: number) => {
              let finalId = post.id
              if (!finalId) {
                finalId = `post-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`
                updatedNeeded = true
              }
              return {
                id: finalId,
                title: post.title || "",
                excerpt: post.excerpt || "",
                content: post.content || "",
                category: post.category || "General",
                date: post.date || "",
                readTime: post.readTime || "",
                coverImage: post.coverImage,
                gradientFrom: post.gradientFrom,
                gradientTo: post.gradientTo,
              }
            })
          }
        } catch (e) {
          console.error("Failed to parse custom posts", e)
        }
      }

      // If we fixed any custom posts without IDs, save them back to localStorage immediately
      if (updatedNeeded) {
        localStorage.setItem("scribbles_custom_posts", JSON.stringify(customPosts))
      }

      if (storedDeletedDefaults) {
        try {
          deletedDefaultIds = JSON.parse(storedDeletedDefaults)
        } catch (e) {
          console.error("Failed to parse deleted defaults", e)
        }
      }

      updatePostsState(customPosts, deletedDefaultIds)
    }, 0)

    return () => clearTimeout(timer)
  }, [updatePostsState])

  const calculateReadTime = (text: string): string => {
    const wordsPerMinute = 200
    const wordCount = text.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute))
    return `${minutes} min read`
  }

  const getDeletedDefaultIds = (): string[] => {
    const storedDeletedDefaults = localStorage.getItem("scribbles_deleted_defaults")
    if (storedDeletedDefaults) {
      try {
        return JSON.parse(storedDeletedDefaults)
      } catch (e) {
        console.error(e)
      }
    }
    return []
  }

  const createPost = (postData: Omit<Post, "id" | "date" | "readTime">) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" }
    const dateStr = new Date().toLocaleDateString("en-US", options)
    const readTime = calculateReadTime(postData.content)
    const uniqueId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newPost: Post = {
      ...postData,
      id: uniqueId,
      date: dateStr,
      readTime
    }

    const storedCustom = localStorage.getItem("scribbles_custom_posts")
    let customList: Post[] = []
    if (storedCustom) {
      try {
        const parsed = JSON.parse(storedCustom)
        if (Array.isArray(parsed)) {
          customList = parsed
        }
      } catch (e) {
        console.error("Failed to parse custom posts", e)
      }
    }

    const updatedCustom = [newPost, ...customList]
    localStorage.setItem("scribbles_custom_posts", JSON.stringify(updatedCustom))

    updatePostsState(updatedCustom, getDeletedDefaultIds())
  }

  const editPost = (id: string, postData: Omit<Post, "id" | "date" | "readTime">) => {
    const isDefault = id.startsWith("default-")
    const readTime = calculateReadTime(postData.content)
    
    const storedCustom = localStorage.getItem("scribbles_custom_posts")
    let customList: Post[] = []
    if (storedCustom) {
      try {
        const parsed = JSON.parse(storedCustom)
        if (Array.isArray(parsed)) {
          customList = parsed
        }
      } catch (e) {
        console.error(e)
      }
    }

    let deletedIds = getDeletedDefaultIds()

    if (isDefault) {
      // 1. Add to deleted defaults
      if (!deletedIds.includes(id)) {
        deletedIds = [...deletedIds, id]
        localStorage.setItem("scribbles_deleted_defaults", JSON.stringify(deletedIds))
      }

      // 2. Add as a new custom post
      const options: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" }
      const dateStr = new Date().toLocaleDateString("en-US", options)
      
      const newCustomPost: Post = {
        ...postData,
        id: `post-${Date.now()}`,
        date: dateStr,
        readTime
      }
      customList = [newCustomPost, ...customList]
    } else {
      // It's a custom post, update it in-place
      customList = customList.map(post => {
        if (post.id === id) {
          return {
            ...post,
            ...postData,
            readTime
          }
        }
        return post
      })
    }

    localStorage.setItem("scribbles_custom_posts", JSON.stringify(customList))

    updatePostsState(customList, deletedIds)
  }

  const deletePost = (id: string) => {
    const isDefault = id.startsWith("default-")

    let customList: Post[] = []
    const storedCustom = localStorage.getItem("scribbles_custom_posts")
    if (storedCustom) {
      try {
        const parsed = JSON.parse(storedCustom)
        if (Array.isArray(parsed)) {
          customList = parsed
        }
      } catch (e) {
        console.error(e)
      }
    }

    let deletedIds = getDeletedDefaultIds()

    if (isDefault) {
      if (!deletedIds.includes(id)) {
        deletedIds = [...deletedIds, id]
        localStorage.setItem("scribbles_deleted_defaults", JSON.stringify(deletedIds))
      }
    } else {
      customList = customList.filter(post => post.id !== id)
      localStorage.setItem("scribbles_custom_posts", JSON.stringify(customList))
    }

    updatePostsState(customList, deletedIds)
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
