"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, BookOpen } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#posts", label: "Featured" },
    { href: "#about", label: "About" },
    { href: "#newsletter", label: "Newsletter" },
  ]

  return (
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
          <a
            href="#posts"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Start Reading
          </a>
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
            <SheetContent side="right" className="p-6">
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
                <a
                  href="#posts"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({ variant: "default", size: "default" }) + " mt-4 w-full text-center"}
                >
                  Start Reading
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
