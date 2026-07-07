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

type DateSort = "newest" | "oldest"
type DateRange = "all" | "week" | "month" | "3months" | "day" | "range"

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "All Time", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Specific Day", value: "day" },
  { label: "Custom Range", value: "range" },
]

function parsePostDate(dateStr: string): number {
  const parsed = Date.parse(dateStr)
  return isNaN(parsed) ? 0 : parsed
}

function getDateRangeCutoff(range: DateRange): number {
  if (range === "all" || range === "day" || range === "range") return 0
  const now = new Date()
  if (range === "week") return now.getTime() - 7 * 24 * 60 * 60 * 1000
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime()
}

function isPostInDay(postDateStr: string, selectedDayStr: string): boolean {
  if (!selectedDayStr) return true
  const postTime = parsePostDate(postDateStr)
  if (postTime === 0) return false

  const postDate = new Date(postTime)
  const [year, month, day] = selectedDayStr.split("-").map(Number)
  
  return (
    postDate.getFullYear() === year &&
    postDate.getMonth() === month - 1 &&
    postDate.getDate() === day
  );
}

function isPostInRange(postDateStr: string, startStr: string, endStr: string): boolean {
  const postTime = parsePostDate(postDateStr)
  if (postTime === 0) return false

  const postDate = new Date(postTime)
  postDate.setHours(0, 0, 0, 0)
  const postMidnight = postDate.getTime()

  if (startStr) {
    const [sYear, sMonth, sDay] = startStr.split("-").map(Number)
    const startDateObj = new Date(sYear, sMonth - 1, sDay)
    startDateObj.setHours(0, 0, 0, 0)
    if (postMidnight < startDateObj.getTime()) return false
  }

  if (endStr) {
    const [eYear, eMonth, eDay] = endStr.split("-").map(Number)
    const endDateObj = new Date(eYear, eMonth - 1, eDay)
    endDateObj.setHours(0, 0, 0, 0)
    if (postMidnight > endDateObj.getTime()) return false
  }

  return true
}

export function PostsListView() {
  const { posts, deletePost } = usePosts()
  const [editingPost, setEditingPost] = React.useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [dateSort, setDateSort] = React.useState<DateSort>("newest")
  const [dateRange, setDateRange] = React.useState<DateRange>("all")

  // Custom date picker states
  const [selectedDay, setSelectedDay] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category)))
    return ["All", ...unique]
  }, [posts])

  const filteredPosts = React.useMemo(() => {
    let filtered = activeFilter === "All"
      ? [...posts]
      : posts.filter((post) => post.category === activeFilter)

    if (dateRange === "day") {
      if (selectedDay) {
        filtered = filtered.filter((post) => isPostInDay(post.date, selectedDay))
      }
    } else if (dateRange === "range") {
      if (startDate || endDate) {
        filtered = filtered.filter((post) => isPostInRange(post.date, startDate, endDate))
      }
    } else {
      const cutoff = getDateRangeCutoff(dateRange)
      if (cutoff > 0) {
        filtered = filtered.filter((post) => parsePostDate(post.date) >= cutoff)
      }
    }

    filtered.sort((a, b) => {
      const dateA = parsePostDate(a.date)
      const dateB = parsePostDate(b.date)
      return dateSort === "newest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [posts, activeFilter, dateSort, dateRange, selectedDay, startDate, endDate])

  const handleDeleteConfirm = () => {
    if (deletingPostId) {
      deletePost(deletingPostId)
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
              {categories.map((cat) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onEdit={() => setEditingPost(post)}
                onDelete={() => setDeletingPostId(post.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No publications found matching your filters.
              </p>
            </div>
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
