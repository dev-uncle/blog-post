"use client"

import { CommentResponse } from "../actions/comments"
import { useComments } from "../hooks/use-comments"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { MessageSquare } from "lucide-react"

interface CommentsSectionProps {
  postId: string
  postAuthorId?: string | null
  initialComments: CommentResponse[]
  currentUserId?: string
  isAuthenticated: boolean
}

export function CommentsSection({
  postId,
  postAuthorId,
  initialComments,
  currentUserId,
  isAuthenticated,
}: CommentsSectionProps) {
  const {
    commentList,
    isSubmitting,
    submitError,
    deletingId,
    updatingId,
    updateError,
    addComment,
    removeComment,
    updateComment,
    isCommentOwner,
    canEditComment,
  } = useComments({ postId, postAuthorId, initialComments, currentUserId })

  return (
    <section id="comments-section" className="mt-14 pt-10 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          {commentList.length === 0
            ? "Comments"
            : commentList.length === 1
            ? "1 Comment"
            : `${commentList.length} Comments`}
        </h2>
      </div>

      {/* Form */}
      <div className="mb-8">
        <CommentForm
          isAuthenticated={isAuthenticated}
          isSubmitting={isSubmitting}
          error={submitError}
          onSubmit={addComment}
        />
      </div>

      {/* Divider between form and list (only when there are comments) */}
      {commentList.length > 0 && <div className="border-t border-border/40 mb-6" />}

      {/* List */}
      <CommentList
        comments={commentList}
        isCommentOwner={isCommentOwner}
        canEditComment={canEditComment}
        deletingId={deletingId}
        updatingId={updatingId}
        updateError={updateError}
        onDelete={removeComment}
        onUpdate={updateComment}
      />
    </section>
  )
}
