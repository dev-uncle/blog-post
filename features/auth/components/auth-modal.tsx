"use client"

import * as React from "react"
import { useAuth } from "../hooks/use-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const { login, signup } = useAuth()
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab)
  
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

  // Reset form errors/state when modal opens/closes or tab changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
      setLoading(false)
      setShowLoginPassword(false)
      setShowSignupPassword(false)
      setShowSignupConfirmPassword(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [open, activeTab])

  // Sync tab with prop when modal opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setActiveTab(defaultTab)
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
      <DialogContent className="max-w-[380px] border border-border/70 bg-background/95 backdrop-blur-md p-6 rounded-xl shadow-2xl">
        <DialogHeader className="items-center text-center gap-1 pb-2">
          <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary mb-1">
            <BookOpen className="size-4.5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Welcome to DevScribbles
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80">
            {activeTab === "login"
              ? "Sign in to share your thoughts and manage your posts."
              : "Create an account to join the writer community."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-2.5 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <span className="text-left leading-snug">{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList variant="default" className="flex w-full mb-4 bg-muted/40 p-0.5 rounded-lg border border-border/30">
            <TabsTrigger value="login" disabled={loading} className="flex-1 cursor-pointer py-1.5 text-xs">Sign In</TabsTrigger>
            <TabsTrigger value="signup" disabled={loading} className="flex-1 cursor-pointer py-1.5 text-xs">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Content */}
          <TabsContent value="login">
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
                    className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                    className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                className="w-full mt-2 cursor-pointer font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors h-9.5 rounded-lg" 
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
          </TabsContent>

          {/* Signup Content */}
          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit} className="space-y-3">
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
                    className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                    className="pl-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                    className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                    className="pl-9 pr-9 bg-muted/10 hover:bg-muted/20 focus-visible:bg-background transition-colors h-9.5 rounded-lg"
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
                className="w-full mt-3 cursor-pointer font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors h-9.5 rounded-lg" 
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
