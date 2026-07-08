import { Post } from "@/features/posts/hooks/use-posts"
import Link from "next/link"
import { Navbar } from "@/features/landing/components/Navbar"
import { Footer } from "@/features/landing/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { CommentsSection } from "./comments-section"
import type { CommentResponse } from "@/features/posts/actions/comments"

interface PostDetailViewProps {
  initialPost: Post
  relatedPosts: Post[]
  initialComments: CommentResponse[]
  currentUserId?: string
  isAuthenticated: boolean
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

export function PostDetailView({ initialPost: post, relatedPosts, initialComments, currentUserId, isAuthenticated }: PostDetailViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Publications
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Main content column */}
            <article className="lg:col-span-8">
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
                <div className="mb-10 rounded-xl overflow-hidden border border-border shadow-xs">
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

              {/* Comments */}
              <CommentsSection
                postId={post.id}
                postAuthorId={post.authorId}
                initialComments={initialComments}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
              />

              {/* Bottom nav */}
              <div className="mt-14 pt-8 border-t border-border">
                <Link href="/">
                  <Button variant="outline" className="cursor-pointer group">
                    <ArrowLeft className="size-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Publications
                  </Button>
                </Link>
              </div>
            </article>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-fit">
              {/* About the Author widget */}
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-0.5">About the Author</h3>
                <div className="flex items-start gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.authorName || "Creator")}`}
                    alt={post.authorName || "Creator"}
                    className="size-11 rounded-full border border-border bg-muted shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-snug">{post.authorName || "DevScribbles Creator"}</h4>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 leading-snug">Contributor at DevScribbles</p>
                    <p className="text-xs text-muted-foreground/90 mt-2.5 leading-relaxed">
                      Sharing tech findings, frontend architecture tips, and fluid design experiences.
                    </p>
                  </div>
                </div>
              </div>

              {/* Read Next widget */}
              {relatedPosts && relatedPosts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Read Next</h3>
                  <div className="flex flex-col gap-3.5">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        href={`/posts/${related.id}`}
                        className="group block p-3.5 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/40 hover:border-border/80 transition-all duration-200 shadow-2xs hover:shadow-xs"
                      >
                        <div className="flex gap-3">
                          {related.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={related.coverImage}
                              alt={related.title}
                              className="w-16 h-16 object-cover rounded-lg border border-border/60 shrink-0"
                            />
                          ) : (
                            <div className={`w-16 h-16 rounded-lg bg-linear-to-br ${getPresetGradient(related.id)} border border-border/60 shrink-0 flex items-center justify-center`}>
                              <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:10px_16px] rounded-lg" />
                            </div>
                          )}
                          <div className="flex flex-col justify-between min-w-0 flex-1">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{related.category}</span>
                              <h4 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors text-foreground">{related.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 mt-1">
                              <span>{related.date}</span>
                              <span>•</span>
                              <span>{related.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
