"use client"

import * as React from "react"
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  CommentResponse,
} from "../actions/comments"

interface UseCommentsOptions {
  postId: string
  postAuthorId?: string | null
  initialComments: CommentResponse[]
  currentUserId?: string
}

export function useComments({
  postId,
  postAuthorId,
  initialComments,
  currentUserId,
}: UseCommentsOptions) {
  const [commentList, setCommentList] = React.useState<CommentResponse[]>(initialComments)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [updateError, setUpdateError] = React.useState<string | null>(null)

  async function addComment(body: string): Promise<boolean> {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await createCommentAction(postId, body)
      if (res.success && res.data) {
        setCommentList((prev) => [res.data!, ...prev])
        return true
      }
      setSubmitError(res.error ?? "Failed to post comment.")
      return false
    } catch {
      setSubmitError("Something went wrong. Please try again.")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  async function removeComment(commentId: string): Promise<void> {
    setDeletingId(commentId)
    try {
      const res = await deleteCommentAction(commentId, postId)
      if (res.success) {
        setCommentList((prev) => prev.filter((c) => c.id !== commentId))
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function updateComment(commentId: string, newBody: string): Promise<boolean> {
    setUpdatingId(commentId)
    setUpdateError(null)
    try {
      const res = await updateCommentAction(commentId, postId, newBody)
      if (res.success && res.data) {
        setCommentList((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, body: res.data!.body } : c))
        )
        return true
      }
      setUpdateError(res.error ?? "Failed to update comment.")
      return false
    } catch {
      setUpdateError("Something went wrong. Please try again.")
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  /** True if the current user is the comment author */
  function isCommentOwner(authorId: string): boolean {
    return !!currentUserId && currentUserId === authorId
  }

  /**
   * True if the current user can EDIT this comment.
   * Rule: must be the comment author AND the post must be theirs too.
   */
  function canEditComment(authorId: string): boolean {
    return isCommentOwner(authorId) && !!currentUserId && currentUserId === postAuthorId
  }

  return {
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
  }
}
