"use client"

import * as React from "react"
import { usePosts, Post } from "../hooks/use-posts"
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
import { Loader2, Sparkles, CheckCircle2, Image as ImageIcon, X } from "lucide-react"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postToEdit?: Post | null
}

const CATEGORIES = ["Development", "Architecture", "Design", "Product", "General"]

export function CreatePostDialog({ open, onOpenChange, postToEdit = null }: CreatePostDialogProps) {
  const { createPost, editPost } = usePosts()
  
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState(CATEGORIES[0])
  const [excerpt, setExcerpt] = React.useState("")
  const [content, setContent] = React.useState("")
  const [coverImage, setCoverImage] = React.useState<string>("")

  const [loading, setLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isEditMode = !!postToEdit

  // Reset or fill state when modal opens/closes or postToEdit changes
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (postToEdit) {
          setTitle(postToEdit.title)
          setCategory(postToEdit.category)
          setExcerpt(postToEdit.excerpt)
          setContent(postToEdit.content)
          setCoverImage(postToEdit.coverImage || "")
        } else {
          setTitle("")
          setCategory(CATEGORIES[0])
          setExcerpt("")
          setContent("")
          setCoverImage("")
        }
        setError(null)
        setShowSuccess(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, postToEdit])

  // Handle Cover Image upload and convert to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    // Validate size (limit to 2MB for localStorage capacity constraints)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError("Image must be smaller than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverImage(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const removeCoverImage = () => {
    setCoverImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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
      
      const postData = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage || undefined,
      }

      if (isEditMode && postToEdit) {
        editPost(postToEdit.id, postData)
      } else {
        createPost(postData)
      }

      setShowSuccess(true)
      
      // Delay closing to show success notification
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      console.error(err)
      setError(isEditMode ? "Failed to save changes. Please try again." : "Failed to publish the post. Please try again.")
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
            <h3 className="text-2xl font-bold text-foreground">
              {isEditMode ? "Changes Saved!" : "Post Published!"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              {isEditMode 
                ? "Your article modifications have been stored successfully."
                : "Your article has been added successfully and is now live on the landing page."}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="gap-1 pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                {isEditMode ? "Edit Publication" : "Write a New Post"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEditMode 
                  ? "Update your draft contents, categories, or cover photo."
                  : "Share your insights, tutorials, or updates with the developer community."}
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
                  <Select value={category} onValueChange={(val) => setCategory(val || CATEGORIES[0])}>
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

              {/* Cover Image Upload (Replaces gradients) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cover Image
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                />

                {coverImage ? (
                  <div className="relative h-40 w-full rounded-lg border border-border overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={coverImage} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white hover:text-destructive transition-colors rounded-full cursor-pointer"
                      title="Remove Image"
                      disabled={loading}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-28 w-full rounded-lg border-2 border-dashed border-border hover:border-foreground/30 hover:bg-muted/10 transition-all duration-200 cursor-pointer"
                    disabled={loading}
                  >
                    <ImageIcon className="size-6 text-muted-foreground mb-1.5" />
                    <span className="text-xs font-medium text-foreground">Upload cover photo</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG up to 2MB</span>
                  </button>
                )}
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
                      Saving...
                    </>
                  ) : (
                    isEditMode ? "Save Changes" : "Publish Post"
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
