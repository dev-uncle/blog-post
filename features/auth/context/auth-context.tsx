"use client"

import * as React from "react"

export interface User {
  name: string
  email: string
  avatar?: string
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
    // Retrieve stored user on component mount (client-side only)
    const storedUser = localStorage.getItem("scribbles_user")
    
    // Schedule state updates asynchronously to avoid synchronous setState inside useEffect body
    const timer = setTimeout(() => {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Failed to parse stored user", e)
        }
      }
      setIsLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // Simple mock auth validation (accepts any credentials for frontend demo)
    if (email && password) {
      // Default mock name based on email prefix if not signed up
      const mockName = email.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
      const loggedUser: User = {
        name: mockName,
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockName)}`
      }
      setUser(loggedUser)
      localStorage.setItem("scribbles_user", JSON.stringify(loggedUser))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (name && email && password) {
      const loggedUser: User = {
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      }
      setUser(loggedUser)
      localStorage.setItem("scribbles_user", JSON.stringify(loggedUser))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const logout = React.useCallback(() => {
    setUser(null)
    localStorage.removeItem("scribbles_user")
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
