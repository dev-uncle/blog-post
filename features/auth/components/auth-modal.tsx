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

// Custom colored Google SVG Icon
const GoogleIcon = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

// Custom GitHub SVG Icon
const GithubIcon = () => (
  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

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

  // Handle mock OAuth flow triggers
  const handleMockOAuth = async (provider: "google" | "github") => {
    setError(null)
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Log in with a generic user corresponding to the provider
      const success = await login(`${provider}@scribbles.com`, "oauth-bypass-pass")
      if (success) {
        onOpenChange(false)
      }
    } catch (err) {
      console.error(err)
      setError(`Failed to sign in with ${provider}.`)
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

        {/* OAuth Buttons Stack */}
        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer h-9.5 justify-center gap-2 font-medium border-border/80 hover:bg-muted/40 transition-colors rounded-lg text-sm"
            onClick={() => handleMockOAuth("google")}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer h-9.5 justify-center gap-2 font-medium border-border/80 hover:bg-muted/40 transition-colors rounded-lg text-sm"
            onClick={() => handleMockOAuth("github")}
            disabled={loading}
          >
            <GithubIcon />
            Continue with GitHub
          </Button>
        </div>

        {/* Custom Text Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <Separator className="w-full bg-border/60" />
          <span className="absolute bg-background px-2 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">
            or use email
          </span>
        </div>

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
