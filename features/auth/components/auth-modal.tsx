"use client"

import * as React from "react"
import { useAuth } from "../hooks/use-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Loader2, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const { login, signup } = useAuth()
  const [mode, setMode] = React.useState<"login" | "signup">(defaultTab === "signup" ? "signup" : "login")
  
  // Login form state
  const [loginEmail, setLoginEmail] = React.useState("")
  const [loginPassword, setLoginPassword] = React.useState("")
  const [showLoginPassword, setShowLoginPassword] = React.useState(false)
  
  // Signup form state
  const [signupName, setSignupName] = React.useState("")
  const [signupEmail, setSignupEmail] = React.useState("")
  const [signupPassword, setSignupPassword] = React.useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState("")
  const [showSignupPassword, setShowSignupPassword] = React.useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = React.useState(false)
  
  // Status states
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form errors/state when modal opens/closes or mode changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
      setLoading(false)
      setShowLoginPassword(false)
      setShowSignupPassword(false)
      setShowSignupConfirmPassword(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [open, mode])

  // Sync mode with prop when modal opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setMode(defaultTab === "signup" ? "signup" : "login")
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, defaultTab])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const success = await login(loginEmail, loginPassword)
      if (success) {
        onOpenChange(false)
        setLoginEmail("")
        setLoginPassword("")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      const success = await signup(signupName, signupEmail, signupPassword)
      if (success) {
        onOpenChange(false)
        setSignupName("")
        setSignupEmail("")
        setSignupPassword("")
        setSignupConfirmPassword("")
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] border border-border/70 bg-background/95 backdrop-blur-md p-6 rounded-xl shadow-2xl">
        <DialogHeader className="items-center text-center gap-1 pb-4">
          <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary mb-1">
            <BookOpen className="size-4.5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "login" ? "Sign in to DevScribbles" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80">
            {mode === "login"
              ? "Share your developer perspectives and write posts."
              : "Join our creator network and publish articles."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-2 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <span className="text-left leading-snug">{error}</span>
          </div>
        )}



        {/* Form area: switches content cleanly based on state */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                  className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                  className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2 cursor-pointer font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors h-9.5 rounded-lg text-sm" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Alex Mercer"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  required
                  className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="signup-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                  className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="signup-password"
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground/85" htmlFor="signup-confirm">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                <Input
                  id="signup-confirm"
                  type={showSignupConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showSignupConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-3 cursor-pointer font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors h-9.5 rounded-lg text-sm" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        )}

        {/* Form Toggle Link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none font-medium"
            disabled={loading}
          >
            {mode === "login" ? (
              <>
                New to DevScribbles?{" "}
                <span className="text-primary hover:underline font-semibold">Create an account</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="text-primary hover:underline font-semibold">Sign In</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
