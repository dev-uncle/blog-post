import { getPostById, getPosts } from "@/features/posts/actions/posts"
import { getCommentsByPostId } from "@/features/posts/actions/comments"
import { PostDetailView } from "@/features/posts/components/post-detail-view"
import { PostsProvider } from "@/features/posts/context/posts-context"
import { getSessionUser } from "@/lib/auth"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, allPosts, initialComments, session] = await Promise.all([
    getPostById(id),
    getPosts(),
    getCommentsByPostId(id),
    getSessionUser(),
  ])

  if (!post) {
    notFound()
  }

  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <PostsProvider initialPosts={allPosts}>
      <PostDetailView
        initialPost={post}
        relatedPosts={relatedPosts}
        initialComments={initialComments}
        currentUserId={session?.userId}
        isAuthenticated={!!session}
      />
    </PostsProvider>
  )
}
