"use server"

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { encrypt, getSessionUser } from "@/lib/auth";
import { seedDemoData } from "@/lib/db/seed";

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Database query failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export async function getCurrentUser(): Promise<ActionResponse<UserResponse | null>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        id: session.userId,
        name: session.name,
        email: session.email,
        avatar: session.avatar,
      },
    };
  } catch (error) {
    console.error("Error fetching current user session:", error);
    return { success: false, error: "Failed to verify session" };
  }
}

export async function login(email: string, password: string): Promise<ActionResponse<UserResponse>> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (email.toLowerCase().trim() === "demo@devscribbles.com") {
      await seedDemoData();
    }

    // Find user in database
    const [user] = await withRetry(() =>
      db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1)
    );

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return { success: false, error: "Invalid email or password" };
    }

    // Generate JWT token
    const token = await encrypt({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Login action error details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login.";
    return { success: false, error: errorMessage };
  }
}

export async function signup(name: string, email: string, password: string): Promise<ActionResponse<UserResponse>> {
  try {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existingUser] = await withRetry(() =>
      db
        .select()
        .from(users)
        .where(eq(users.email, cleanEmail))
        .limit(1)
    );

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Create user in DB
    const [newUser] = await withRetry(() =>
      db
        .insert(users)
        .values({
          name,
          email: cleanEmail,
          passwordHash,
          avatar,
        })
        .returning()
    );

    // Generate JWT token
    const token = await encrypt({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar || undefined,
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return {
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    };
  } catch (error) {
    console.error("Signup action error details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during signup.";
    return { success: false, error: errorMessage };
  }
}

export async function logout(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
  } catch (error) {
    console.error("Logout action error:", error);
    return { success: false, error: "Failed to log out" };
  }
}
