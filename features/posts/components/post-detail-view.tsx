"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { usePosts } from "@/features/posts/hooks/use-posts"
import { Navbar } from "@/features/landing/components/Navbar"
import { Footer } from "@/features/landing/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export function PostDetailView() {
  const params = useParams<{ id: string }>()
  const { posts } = usePosts()
  const [isLoading, setIsLoading] = React.useState(true)

  const post = React.useMemo(() => {
    return posts.find((p) => p.id === params.id) || null
  }, [posts, params.id])

  React.useEffect(() => {
    // Wait for posts to hydrate from localStorage
    if (posts.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 0)
      return () => clearTimeout(timer)
    }
    const fallback = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(fallback)
  }, [posts])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {isLoading ? (
          /* Loading skeleton */
          <article className="py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-6">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-10 w-3/4 bg-muted rounded" />
                <div className="flex gap-4">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="h-64 bg-muted rounded-xl" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              </div>
            </div>
          </article>
        ) : !post ? (
          /* Not found */
          <div className="py-32 text-center">
            <div className="mx-auto max-w-md px-4">
              <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The publication you are looking for does not exist or may have been deleted.
              </p>
              <Link href="/">
                <Button variant="outline" className="cursor-pointer">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Post content */
          <article className="py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              {/* Back link */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                Back to Publications
              </Link>

              {/* Category Badge */}
              <Badge variant="secondary" className="mb-4 font-semibold">
                {post.category}
              </Badge>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Cover Image */}
              {post.coverImage ? (
                <div className="mb-10 rounded-xl overflow-hidden border border-border shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-[480px]"
                  />
                </div>
              ) : (post.gradientFrom || post.gradientTo) ? (
                <div className={`mb-10 rounded-xl h-48 bg-linear-to-br ${post.gradientFrom || 'from-muted/40'} ${post.gradientTo || 'to-muted/80'} border border-border`}>
                  <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:14px_24px] rounded-xl" />
                </div>
              ) : null}

              {/* Excerpt */}
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 italic border-l-4 border-primary/30 pl-4">
                {post.excerpt}
              </p>

              {/* Content body */}
              <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-base whitespace-pre-line">
                {post.content}
              </div>

              {/* Bottom nav */}
              <div className="mt-16 pt-8 border-t border-border">
                <Link href="/">
                  <Button variant="outline" className="cursor-pointer group">
                    <ArrowLeft className="size-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Publications
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  )
}
