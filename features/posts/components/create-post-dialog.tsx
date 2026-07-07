"use client"

import * as React from "react"
import { usePosts } from "../hooks/use-posts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GRADIENT_PRESETS = [
  { id: "blue-indigo", name: "Blue Indigo", from: "from-blue-500/20", to: "to-indigo-600/20" },
  { id: "cyan-blue", name: "Cyan Blue", from: "from-cyan-500/20", to: "to-blue-500/20" },
  { id: "blue-sky", name: "Blue Sky", from: "from-blue-600/20", to: "to-sky-400/20" },
  { id: "purple-pink", name: "Purple Pink", from: "from-purple-500/20", to: "to-pink-500/20" },
  { id: "emerald-teal", name: "Emerald Teal", from: "from-emerald-500/20", to: "to-teal-500/20" },
  { id: "amber-orange", name: "Amber Orange", from: "from-amber-500/20", to: "to-orange-500/20" },
]

const CATEGORIES = ["Development", "Architecture", "Design", "Product", "General"]

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { createPost } = usePosts()
  
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState(CATEGORIES[0])
  const [excerpt, setExcerpt] = React.useState("")
  const [content, setContent] = React.useState("")
  const [selectedGradient, setSelectedGradient] = React.useState(GRADIENT_PRESETS[0])

  const [loading, setLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setTitle("")
        setCategory(CATEGORIES[0])
        setExcerpt("")
        setContent("")
        setSelectedGradient(GRADIENT_PRESETS[0])
        setError(null)
        setShowSuccess(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (!excerpt.trim()) {
      setError("A short summary/excerpt is required")
      return
    }
    if (!content.trim()) {
      setError("Article content is required")
      return
    }

    setLoading(true)

    try {
      // Mock network latency
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      createPost({
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim(),
        gradientFrom: selectedGradient.from,
        gradientTo: selectedGradient.to,
      })

      setShowSuccess(true)
      
      // Delay closing to show success notification
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      console.error(err)
      setError("Failed to publish the post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading || showSuccess ? undefined : onOpenChange}>
      <DialogContent className="max-w-[600px] border border-border/80 bg-background/95 backdrop-blur-md p-8 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center size-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
              <CheckCircle2 className="size-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Post Published!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Your article has been added successfully and is now live on the landing page.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="gap-1 pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Write a New Post
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Share your insights, tutorials, or updates with the developer community.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="post-title">
                  Title
                </label>
                <Input
                  id="post-title"
                  placeholder="e.g. Mastering Advanced Next.js Features"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                  className="text-lg font-medium h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-9 cursor-pointer">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="border border-border bg-background shadow-md rounded-md p-1">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="post-excerpt">
                    Excerpt / Summary
                  </label>
                  <Input
                    id="post-excerpt"
                    placeholder="Short description for the card preview..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Cover Gradient Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cover Card Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_PRESETS.map((preset) => {
                    const isSelected = selectedGradient.id === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedGradient(preset)}
                        className={`group relative h-12 rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                          isSelected ? "border-primary scale-95 shadow-xs" : "border-border hover:border-foreground/30"
                        }`}
                        title={preset.name}
                      >
                        <div className={`absolute inset-0 bg-linear-to-br ${preset.from} ${preset.to}`} />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:6px_10px]" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-primary">
                            <span className="bg-background size-5 rounded-full flex items-center justify-center shadow-xs border border-primary/20">
                              <span className="size-2 rounded-full bg-primary" />
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="post-content">
                  Article Content
                </label>
                <Textarea
                  id="post-content"
                  placeholder="Write your article body here..."
                  className="min-h-48 resize-y"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="cursor-pointer font-medium">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
