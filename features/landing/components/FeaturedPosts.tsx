"use client"

import { PostCard } from "./PostCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { usePosts } from "@/features/posts/hooks/use-posts"

export function FeaturedPosts() {
  const { posts } = usePosts()

  return (
    <section id="posts" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Latest Publications
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Deep dives, case studies, and engineering journals designed to sharpen your skills.
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-end group cursor-pointer">
            View All Posts
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <PostCard key={idx} {...post} />
          ))}
        </div>
      </div>
    </section>
  )
}
