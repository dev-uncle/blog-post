"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowUpRight } from "lucide-react"

interface PostCardProps {
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  gradientFrom: string
  gradientTo: string
}

export function PostCard({
  title,
  excerpt,
  date,
  readTime,
  category,
  gradientFrom,
  gradientTo,
}: PostCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 border border-border group bg-card">
      {/* Decorative gradient header instead of standard image */}
      <div className={`h-40 w-full bg-linear-to-br ${gradientFrom} ${gradientTo} relative overflow-hidden flex items-end p-6 border-b border-border`}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-xs font-semibold">
          {category}
        </Badge>
      </div>

      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          <a href="#" className="inline-flex items-center gap-1.5 focus:outline-none">
            {title}
            <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0" />
          </a>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 py-2 flex-grow">
        <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">
          {excerpt}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>{readTime}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
