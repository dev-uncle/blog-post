import { Post } from "@/features/posts/hooks/use-posts"
import Link from "next/link"
import { Navbar } from "@/features/landing/components/Navbar"
import { Footer } from "@/features/landing/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

interface PostDetailViewProps {
  initialPost: Post
}

const GRADIENT_PRESETS = [
  "from-blue-500/20 to-indigo-600/20",
  "from-purple-500/20 to-pink-600/20",
  "from-emerald-500/20 to-teal-600/20",
  "from-cyan-500/20 to-blue-500/20",
  "from-orange-500/20 to-rose-600/20",
]

function getPresetGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % GRADIENT_PRESETS.length
  return GRADIENT_PRESETS[index]
}

export function PostDetailView({ initialPost: post }: PostDetailViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">

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
              ) : (
                <div className={`mb-10 rounded-xl h-48 bg-linear-to-br ${getPresetGradient(post.id)} border border-border`}>
                  <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:14px_24px] rounded-xl" />
                </div>
              )}

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
      </main>
      <Footer />
    </div>
  )
}
