// app/api/(public)/blog/[slug]/registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Unwrap the params promise
    const { slug } = await params;
    
    // Get the post
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (!post) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    
    // Check permissions
    if (!user || (
      user.role !== "admin" && 
      user.role !== "editor" && 
      post.authorId !== user.id
    )) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Get registrations
    const registrations = await db
      .select({
        registration: eventRegistrations,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.postId, post.id))
      .orderBy(desc(eventRegistrations.registeredAt));

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error in event registrations API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}