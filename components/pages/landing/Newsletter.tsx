"use client"

import * as React from "react"
import { Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  const [email, setEmail] = React.useState("")
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitted(true)
    setEmail("")
  }

  return (
    <section id="newsletter" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative blurred backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-primary/10 bg-linear-to-b from-primary/5 to-transparent p-8 sm:p-12 md:p-16 text-center shadow-xs">
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <Mail className="size-6" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Subscribe to DevScribbles Weekly
          </h2>
          
          <p className="mx-auto max-w-lg text-muted-foreground leading-relaxed mb-8">
            Join 15,000+ developers receiving monthly roundups, performance tips, and CSS recipes. Zero spam, unsubscribe with one click.
          </p>

          {isSubmitted ? (
            <div className="inline-flex items-center gap-2 text-primary font-semibold bg-primary/10 px-6 py-3 rounded-full border border-primary/20 animate-fade-in">
              <CheckCircle2 className="size-5" />
              <span>Thank you! Check your inbox to confirm your subscription.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-background border-border text-foreground px-4 py-3 rounded-md focus-visible:ring-primary/20"
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto font-medium cursor-pointer">
                Subscribe Now
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  )
}
