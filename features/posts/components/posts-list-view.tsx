"use client"

import * as React from "react"
import Link from "next/link"
import { usePosts, Post } from "@/features/posts/hooks/use-posts"
import { Navbar } from "@/features/landing/components/Navbar"
import { Footer } from "@/features/landing/components/Footer"
import { PostCard } from "@/features/landing/components/PostCard"
import { CreatePostDialog } from "@/features/posts/components/create-post-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowUpDown, Calendar as CalendarIcon } from "lucide-react"
import { getPaginatedPosts } from "@/features/posts/actions/posts"

type DateSort = "newest" | "oldest"
type DateRange = "all" | "week" | "month" | "3months" | "day" | "range"

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "All Time", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Specific Day", value: "day" },
  { label: "Custom Range", value: "range" },
]

const CATEGORIES = ["All", "Development", "Architecture", "Design", "Product", "General"]

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    if (start > 2) {
      pages.push("...");
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages - 1) {
      pages.push("...");
    }
    
    pages.push(totalPages);
  }
  
  return pages;
}

export function PostsListView() {
  const { posts: contextPosts, deletePost } = usePosts()
  
  const [posts, setPosts] = React.useState<Post[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const [editingPost, setEditingPost] = React.useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = React.useState<string | null>(null)
  
  // Filter and sort states
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [dateSort, setDateSort] = React.useState<DateSort>("newest")
  const [dateRange, setDateRange] = React.useState<DateRange>("all")

  // Custom date picker states
  const [selectedDay, setSelectedDay] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")

  const fetchPosts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getPaginatedPosts({
        page: currentPage,
        limit: 12, // 12 posts per page
        category: activeFilter,
        dateSort,
        dateRange,
        selectedDay,
        startDate,
        endDate,
      })
      
      // Map post list from backend response format
      setPosts(res.posts as unknown as Post[])
      setTotalPages(res.totalPages)
      setTotalCount(res.totalCount)
    } catch (err) {
      console.error("Failed to fetch paginated posts from backend:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, activeFilter, dateSort, dateRange, selectedDay, startDate, endDate])

  // Fetch posts on filters or page change
  React.useEffect(() => {
    fetchPosts()
  }, [fetchPosts, contextPosts]) // Sync with contextPosts updates (e.g. edit, create, delete)

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, dateSort, dateRange, selectedDay, startDate, endDate])

  const handleDeleteConfirm = async () => {
    if (deletingPostId) {
      const result = await deletePost(deletingPostId)
      if (result.success) {
        fetchPosts()
      }
      setDeletingPostId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back + Header */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
              All Publications
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse all posts. Filter by category, date range, or sort by date.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 mb-10">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer
                    border transition-all duration-200 ease-out
                    ${activeFilter === cat
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Date Range + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <CalendarIcon className="size-3.5 text-muted-foreground mr-0.5" />
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium cursor-pointer
                      border transition-all duration-200 ease-out
                      ${dateRange === range.value
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                <button
                  onClick={() => setDateSort(dateSort === "newest" ? "oldest" : "newest")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                >
                  {dateSort === "newest" ? "Newest First" : "Oldest First"}
                </button>
              </div>
            </div>

            {/* Conditional Date Pickers */}
            {dateRange === "day" && (
              <div className="flex items-center gap-3 mt-3.5 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-border/40 pt-3.5">
                <label className="text-xs font-semibold text-muted-foreground mr-1" htmlFor="specific-day">Select Day:</label>
                <input
                  id="specific-day"
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="bg-card/40 hover:bg-card/60 backdrop-blur-xs text-xs font-medium border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-lg px-3 py-1.5 outline-none text-foreground cursor-pointer"
                />
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay("")}
                    className="text-[10px] font-bold text-destructive hover:underline cursor-pointer select-none uppercase tracking-wider pl-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {dateRange === "range" && (
              <div className="flex flex-wrap items-center gap-3 mt-3.5 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-border/40 pt-3.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="start-date">From:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-card/40 hover:bg-card/60 backdrop-blur-xs text-xs font-medium border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-lg px-3 py-1.5 outline-none text-foreground cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="end-date">To:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-card/40 hover:bg-card/60 backdrop-blur-xs text-xs font-medium border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-lg px-3 py-1.5 outline-none text-foreground cursor-pointer"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                    className="text-[10px] font-bold text-destructive hover:underline cursor-pointer select-none uppercase tracking-wider pl-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Post Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex flex-col h-full border border-border/60 rounded-xl overflow-hidden bg-card/50 animate-pulse">
                  <div className="h-40 w-full bg-muted/40" />
                  <div className="p-6 flex-grow space-y-4">
                    <div className="h-4 w-1/3 bg-muted/40 rounded-md" />
                    <div className="h-6 w-3/4 bg-muted/40 rounded-md" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted/40 rounded-md" />
                      <div className="h-4 w-5/6 bg-muted/40 rounded-md" />
                    </div>
                  </div>
                  <div className="p-6 pt-4 border-t border-border/50 flex justify-between">
                    <div className="h-4 w-1/4 bg-muted/40 rounded-md" />
                    <div className="h-4 w-1/4 bg-muted/40 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No publications found matching your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => setDeletingPostId(post.id)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 border-t border-border/50 pt-8">
                  <p className="text-xs text-muted-foreground">
                    Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span> ({totalCount} publications)
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
                    <Button
                      id="btn-prev-page"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer h-8 text-xs px-3"
                    >
                      Previous
                    </Button>
                    
                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="size-8 flex items-center justify-center text-xs text-muted-foreground select-none"
                          >
                            ...
                          </span>
                        )
                      }
                      return (
                        <Button
                          key={p}
                          id={`btn-page-${p}`}
                          variant={currentPage === p ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(Number(p))}
                          className="size-8 cursor-pointer text-xs"
                        >
                          {p}
                        </Button>
                      )
                    })}
                    
                    <Button
                      id="btn-next-page"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer h-8 text-xs px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Post Dialog */}
      <CreatePostDialog
        open={editingPost !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPost(null)
        }}
        postToEdit={editingPost}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingPostId !== null} onOpenChange={(open) => { if (!open) setDeletingPostId(null) }}>
        <DialogContent className="max-w-[400px] border border-border/80 bg-background/95 backdrop-blur-md p-6 rounded-xl shadow-2xl">
          <DialogHeader className="gap-1.5 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              Delete Publication
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/80">
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeletingPostId(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
