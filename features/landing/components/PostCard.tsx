"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowUpRight, Trash2, Edit, MessageSquare } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface PostCardProps {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  coverImage?: string | null
  authorId?: string | null
  commentCount?: number
  onEdit?: () => void
  onDelete?: () => void
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

export function PostCard({
  id,
  title,
  excerpt,
  date,
  readTime,
  category,
  coverImage,
  authorId,
  commentCount,
  onEdit,
  onDelete,
}: PostCardProps) {
  const { isAuthenticated, user } = useAuth()
  const canEditOrDelete = isAuthenticated && (!authorId || authorId === user?.id)

  return (
    <Link href={`/posts/${id}`} className="block focus:outline-none">
      <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 border border-border group bg-card relative overflow-hidden">
        {/* Overlay controls for Edit/Delete (visible when authorized) */}
        {canEditOrDelete && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="outline"
              className="size-7 bg-background/95 hover:bg-accent border border-border/80 cursor-pointer shadow-xs p-0 flex items-center justify-center rounded-md"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit?.()
              }}
              title="Edit Post"
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              className="size-7 bg-background/95 hover:bg-destructive hover:text-destructive-foreground border border-border/80 cursor-pointer shadow-xs p-0 flex items-center justify-center rounded-md text-destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete?.()
              }}
              title="Delete Post"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}

        {/* Cover image or decorative gradient header */}
        <div className="h-40 w-full relative overflow-hidden flex items-end p-6 border-b border-border bg-muted/20">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={coverImage} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 bg-linear-to-br ${getPresetGradient(id)}`} />
          )}
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-xs font-semibold relative z-10">
            {category}
          </Badge>
        </div>

        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            <span className="inline-flex items-center gap-1.5">
              {title}
              <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0" />
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-2 flex-grow">
          <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">
            {excerpt}
          </p>
        </CardContent>

        <CardFooter className="p-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>{readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
            <MessageSquare className="size-3.5" />
            <span className="font-medium text-foreground">{commentCount ?? 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
