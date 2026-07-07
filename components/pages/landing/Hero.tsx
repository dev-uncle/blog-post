"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden py-20 lg:py-32 bg-linear-to-b from-background to-muted/30">
      {/* Background radial accent */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary tracking-wide">
              <span>🚀 What's New:</span>
              <span className="font-normal text-muted-foreground">Next.js 16 is officially here</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
              A Developer's Space for{" "}
              <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Code, Design, & Ideas
              </span>
            </h1>
            
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              Welcome to my digital garden. Explore deep dives, tutorials, and perspectives on building modern web applications, UI design systems, and boosting engineering productivity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="#posts"
                className={buttonVariants({ size: "lg", variant: "default" }) + " cursor-pointer group text-center flex items-center justify-center gap-1.5"}
              >
                Explore Articles
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#newsletter"
                className={buttonVariants({ size: "lg", variant: "outline" }) + " cursor-pointer text-center"}
              >
                Subscribe to Newsletter
              </a>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-bold text-foreground">15k+</span> Active Readers
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="font-bold text-foreground">50+</span> In-depth Articles
              </div>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="lg:col-span-5 relative w-full aspect-16/10 lg:aspect-square rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
            <Image
              src="/hero-graphic.jpg"
              alt="Developer abstract representation"
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
