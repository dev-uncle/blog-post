"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { SendHorizonal, LogIn } from "lucide-react"
import Link from "next/link"

interface CommentFormProps {
  isAuthenticated: boolean
  isSubmitting: boolean
  error: string | null
  onSubmit: (body: string) => Promise<boolean>
}

export function CommentForm({ isAuthenticated, isSubmitting, error, onSubmit }: CommentFormProps) {
  const [body, setBody] = React.useState("")
  const MAX = 1000

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    const ok = await onSubmit(body)
    if (ok) setBody("")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 rounded-xl border border-dashed border-border/60 bg-muted/20 text-center">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
          <LogIn className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Sign in to join the conversation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your thoughts by creating a free account.
          </p>
        </div>
        <Link href="/">
          <Button
            id="comment-sign-in-btn"
            size="sm"
            className="mt-1 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
          >
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          id="comment-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your comment…"
          maxLength={MAX}
          rows={3}
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="absolute bottom-2.5 right-3 text-[11px] text-muted-foreground/50 select-none">
          {body.length}/{MAX}
        </span>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium px-1">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          id="comment-submit-btn"
          type="submit"
          size="sm"
          disabled={!body.trim() || isSubmitting}
          className="gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all"
        >
          {isSubmitting ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Posting…
            </>
          ) : (
            <>
              <SendHorizonal className="size-3.5" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
