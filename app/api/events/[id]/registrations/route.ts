// ==========================================
// app/api/events/[id]/registrations/route.ts
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireContributor } from "@/lib/auth";

// GET event registrations (admin/author only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContributor();
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    // Get the event
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    if (!post) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!post.isEvent) {
      return NextResponse.json(
        { error: "This post is not an event" },
        { status: 400 }
      );
    }

    // Check permissions
    if (
      user.role !== "admin" && 
      user.role !== "editor" && 
      post.authorId !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized to view registrations" },
        { status: 403 }
      );
    }

    // Get all registrations
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
      .where(eq(eventRegistrations.postId, postId))
      .orderBy(desc(eventRegistrations.registeredAt));

    return NextResponse.json({
      registrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}