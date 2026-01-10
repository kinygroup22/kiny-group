// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    
    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }
    
    // Get user's current password hash
    const [userRecord] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, user.id));
    
    if (!userRecord || !userRecord.password) {
      return NextResponse.json(
        { error: "User not found or password not set" },
        { status: 404 }
      );
    }
    
    // Verify current password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(currentPassword, userRecord.password);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return NextResponse.json(
        { error: "Error verifying password" },
        { status: 500 }
      );
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    let newPasswordHash: string;
    try {
      const saltRounds = 10;
      newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    } catch (error) {
      console.error("Error hashing password:", error);
      return NextResponse.json(
        { error: "Error creating new password" },
        { status: 500 }
      );
    }
    
    // Update the password and updatedAt timestamp
    await db
      .update(users)
      .set({ 
        password: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    return NextResponse.json(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}