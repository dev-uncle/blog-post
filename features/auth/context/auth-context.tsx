"use client"

import * as React from "react"
import { login as loginAction, signup as signupAction, logout as logoutAction, getCurrentUser } from "@/app/actions/auth"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Check if there is an active session on mount
    async function checkSession() {
      try {
        const res = await getCurrentUser()
        if (res.success && res.data) {
          setUser(res.data)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to restore session:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await loginAction(email, password)
      if (res.success && res.data) {
        setUser(res.data)
        setIsLoading(false)
        return true
      }
      setIsLoading(false)
      return false
    } catch (e) {
      console.error(e)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await signupAction(name, email, password)
      if (res.success && res.data) {
        setUser(res.data)
        setIsLoading(false)
        return true
      }
      setIsLoading(false)
      return false
    } catch (e) {
      console.error(e)
      setIsLoading(false)
      return false
    }
  }

  const logout = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await logoutAction()
      setUser(null)
    } catch (e) {
      console.error("Failed to log out:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
