import { getPostById } from "@/app/actions/posts"
import { PostDetailView } from "@/features/posts/components/post-detail-view"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return <PostDetailView initialPost={post} />
}
