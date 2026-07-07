"use client"

import * as React from "react"

export interface Post {
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  gradientFrom: string
  gradientTo: string
}

const DEFAULT_POSTS: Post[] = [
  {
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

interface PostsContextType {
  posts: Post[]
  createPost: (postData: Omit<Post, "date" | "readTime">) => void
}

const PostsContext = React.createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = React.useState<Post[]>([])

  React.useEffect(() => {
    // Load custom posts from localStorage and combine with defaults
    const storedPosts = localStorage.getItem("scribbles_custom_posts")
    
    const timer = setTimeout(() => {
      if (storedPosts) {
        try {
          const customPosts: Post[] = JSON.parse(storedPosts)
          setPosts([...customPosts, ...DEFAULT_POSTS])
        } catch (e) {
          console.error("Failed to parse custom posts", e)
          setPosts(DEFAULT_POSTS)
        }
      } else {
        setPosts(DEFAULT_POSTS)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const createPost = (postData: Omit<Post, "date" | "readTime">) => {
    // Calculate read time based on content length
    const wordsPerMinute = 200
    const wordCount = postData.content.trim().split(/\s+/).length
    const readTimeMinutes = Math.max(1, Math.round(wordCount / wordsPerMinute))
    
    // Format current date
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" }
    const dateStr = new Date().toLocaleDateString("en-US", options)

    const newPost: Post = {
      ...postData,
      date: dateStr,
      readTime: `${readTimeMinutes} min read`
    }

    // Update state and localStorage (newest dynamic posts appear first)
    const storedCustom = localStorage.getItem("scribbles_custom_posts")
    let customList: Post[] = []
    if (storedCustom) {
      try {
        customList = JSON.parse(storedCustom)
      } catch (e) {
        console.error("Failed to parse existing custom posts", e)
      }
    }

    const updatedCustom = [newPost, ...customList]
    localStorage.setItem("scribbles_custom_posts", JSON.stringify(updatedCustom))
    setPosts([...updatedCustom, ...DEFAULT_POSTS])
  }

  return (
    <PostsContext.Provider value={{ posts, createPost }}>
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
