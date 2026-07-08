"use client"

import * as React from "react"
import { CommentResponse } from "../actions/comments"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Check, X } from "lucide-react"

interface CommentListProps {
  comments: CommentResponse[]
  isCommentOwner: (authorId: string) => boolean
  canEditComment: (authorId: string) => boolean
  deletingId: string | null
  updatingId: string | null
  updateError: string | null
  onDelete: (commentId: string) => void
  onUpdate: (commentId: string, newBody: string) => Promise<boolean>
}

export function CommentList({
  comments,
  isCommentOwner,
  canEditComment,
  deletingId,
  updatingId,
  updateError,
  onDelete,
  onUpdate,
}: CommentListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editBody, setEditBody] = React.useState("")
  const MAX = 1000

  function startEdit(comment: CommentResponse) {
    setEditingId(comment.id)
    setEditBody(comment.body)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditBody("")
  }

  async function submitEdit(commentId: string) {
    const ok = await onUpdate(commentId, editBody)
    if (ok) {
      setEditingId(null)
      setEditBody("")
    }
  }

  if (comments.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground/70">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-5">
      {comments.map((comment) => {
        const initials = comment.authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        const isDeleting = deletingId === comment.id
        const isUpdating = updatingId === comment.id
        const isEditing = editingId === comment.id
        const showEdit = canEditComment(comment.authorId)
        const showDelete = isCommentOwner(comment.authorId)

        return (
          <li
            key={comment.id}
            className="group flex gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                comment.authorAvatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  comment.authorName
                )}`
              }
              alt={comment.authorName}
              className="size-8 rounded-full border border-border/60 bg-muted shrink-0 mt-0.5"
            />

            {/* Bubble */}
            <div className="flex-1 min-w-0">
              {/* Author + timestamp */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {comment.authorName}
                </span>
                <span className="text-[11px] text-muted-foreground/60">{comment.createdAt}</span>
                {showEdit && !isEditing && (
                  <span className="ml-1 text-[10px] font-medium text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full leading-none select-none">
                    editable
                  </span>
                )}
              </div>

              {/* Body or inline editor */}
              <div className="relative rounded-xl rounded-tl-sm border border-border/40 bg-muted/30 px-4 py-3">
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="relative">
                      <textarea
                        id={`edit-comment-${comment.id}`}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        maxLength={MAX}
                        rows={3}
                        autoFocus
                        disabled={isUpdating}
                        className="w-full resize-none rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:opacity-50"
                      />
                      <span className="absolute bottom-2 right-2.5 text-[10px] text-muted-foreground/50 select-none">
                        {editBody.length}/{MAX}
                      </span>
                    </div>

                    {updateError && editingId === comment.id && (
                      <p className="text-xs text-destructive font-medium">{updateError}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        id={`save-edit-comment-${comment.id}`}
                        size="sm"
                        disabled={!editBody.trim() || isUpdating}
                        onClick={() => submitEdit(comment.id)}
                        className="h-7 gap-1.5 text-xs cursor-pointer"
                      >
                        {isUpdating ? (
                          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Check className="size-3" />
                        )}
                        Save
                      </Button>
                      <Button
                        id={`cancel-edit-comment-${comment.id}`}
                        size="sm"
                        variant="ghost"
                        disabled={isUpdating}
                        onClick={cancelEdit}
                        className="h-7 gap-1.5 text-xs cursor-pointer text-muted-foreground"
                      >
                        <X className="size-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words pr-14">
                    {comment.body}
                  </p>
                )}

                {/* Action buttons (edit + delete) — only when NOT in edit mode */}
                {!isEditing && (showEdit || showDelete) && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showEdit && (
                      <Button
                        id={`edit-comment-btn-${comment.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(comment)}
                        className="size-6 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                        title="Edit comment"
                      >
                        <Pencil className="size-3" />
                      </Button>
                    )}
                    {showDelete && (
                      <Button
                        id={`delete-comment-${comment.id}`}
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => onDelete(comment.id)}
                        className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete comment"
                      >
                        {isDeleting ? (
                          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* "editable" badge hint */}
              {showEdit && !isEditing && (
                <p className="mt-1 text-[10px] text-muted-foreground/50 pl-0.5">
                  You can edit this comment because it&apos;s on your post.
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
