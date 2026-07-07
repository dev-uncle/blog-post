"use client"

import * as React from "react"
import { useAuth } from "../hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PenSquare, LogOut, Plus } from "lucide-react"

interface AuthStatusProps {
  onOpenAuthModal: (tab: "login" | "signup") => void
  onOpenCreatePostModal: () => void
  mobile?: boolean
}

export function AuthStatus({ onOpenAuthModal, onOpenCreatePostModal, mobile = false }: AuthStatusProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  // Prevent layout shift during initial hydration
  if (isLoading) {
    return (
      <div className={`flex items-center ${mobile ? "w-full" : "h-9 w-24"} justify-center`}>
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // 1. Authenticated User UI
  if (isAuthenticated && user) {
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    if (mobile) {
      return (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
            <Avatar size="default">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <Button
            onClick={onOpenCreatePostModal}
            variant="default"
            size="default"
            className="w-full justify-center gap-2 cursor-pointer"
          >
            <PenSquare className="size-4" />
            Write a Post
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            size="default"
            className="w-full justify-center gap-2 cursor-pointer text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      )
    }

    // Desktop Authenticated UI
    return (
      <div className="flex items-center gap-4">
        <Button
          onClick={onOpenCreatePostModal}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 font-medium cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/40"
        >
          <Plus className="size-4" />
          <span>Write</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center justify-center outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105">
                <Avatar size="default">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 mt-2 border border-border/80 bg-background/95 backdrop-blur-md shadow-lg p-1.5 rounded-lg">
            <div className="px-2.5 py-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
            <DropdownMenuItem
              onClick={onOpenCreatePostModal}
              className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-foreground/80 hover:text-foreground focus:bg-accent/50"
            >
              <PenSquare className="size-4 text-muted-foreground group-focus/dropdown-menu-item:text-foreground" />
              <span>Create New Post</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // 2. Guest User UI
  if (mobile) {
    return (
      <div className="flex flex-col gap-3 w-full mt-4">
        <Button
          onClick={() => onOpenAuthModal("login")}
          variant="outline"
          size="default"
          className="w-full cursor-pointer justify-center"
        >
          Sign In
        </Button>
        <Button
          onClick={() => onOpenAuthModal("signup")}
          variant="default"
          size="default"
          className="w-full cursor-pointer justify-center"
        >
          Get Started
        </Button>
      </div>
    )
  }

  // Desktop Guest UI
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={() => onOpenAuthModal("login")}
        variant="ghost"
        size="sm"
        className="font-medium cursor-pointer text-muted-foreground hover:text-foreground"
      >
        Sign In
      </Button>
      <Button
        onClick={() => onOpenAuthModal("signup")}
        variant="default"
        size="sm"
        className="font-medium cursor-pointer shadow-xs hover:shadow-md transition-shadow"
      >
        Get Started
      </Button>
    </div>
  )
}
