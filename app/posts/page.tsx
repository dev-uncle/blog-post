import { getPosts } from "@/features/posts/actions/posts"
import { PostsListView } from "@/features/posts/components/posts-list-view"
import { PostsProvider } from "@/features/posts/context/posts-context"

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <PostsProvider initialPosts={posts}>
      <PostsListView />
    </PostsProvider>
  )
}
