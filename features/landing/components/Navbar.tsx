"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AuthStatus } from "@/features/auth/components/auth-status"
import { AuthModal } from "@/features/auth/components/auth-modal"
import { CreatePostDialog } from "@/features/posts/components/create-post-dialog"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)
  const [authModalTab, setAuthModalTab] = React.useState<"login" | "signup">("login")
  const [createPostOpen, setCreatePostOpen] = React.useState(false)

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#posts", label: "Featured" },
    { href: "#about", label: "About" },
    { href: "#newsletter", label: "Newsletter" },
  ]

  const handleOpenAuth = (tab: "login" | "signup") => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary tracking-tight">
            <BookOpen className="size-5" />
            <span>DevScribbles</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pl-2 border-l border-border/50">
              <AuthStatus
                onOpenAuthModal={handleOpenAuth}
                onOpenCreatePostModal={() => setCreatePostOpen(true)}
              />
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="h-9 w-9">
                    <Menu className="size-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                }
              />
              <SheetContent side="right" className="p-6 flex flex-col justify-between">
                <div>
                  <SheetHeader className="text-left border-b border-border pb-4 mb-4">
                    <SheetTitle className="flex items-center gap-2 text-primary font-semibold text-lg">
                      <BookOpen className="size-5" />
                      <span>DevScribbles</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <AuthStatus
                    mobile
                    onOpenAuthModal={(tab) => {
                      setIsOpen(false)
                      handleOpenAuth(tab)
                    }}
                    onOpenCreatePostModal={() => {
                      setIsOpen(false)
                      setCreatePostOpen(true)
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Modals & Dialogs */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
      />
    </>
  )
}
