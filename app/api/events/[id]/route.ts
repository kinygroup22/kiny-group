// ==========================================
// app/api/events/[id]/route.ts
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, eventRegistrations } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// GET single event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    // Get current user (if logged in)
    const currentUser = await getCurrentUser();

    const [event] = await db
      .select({
        post: blogPosts,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(blogPosts)
      .innerJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          eq(blogPosts.id, postId),
          eq(blogPosts.isEvent, true)
        )
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get registration count
    const [{ count: registrationCount }] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.postId, postId));

    // Check if user is registered (if logged in)
    let isUserRegistered = false;
    if (currentUser) {
      const [registration] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.postId, postId),
            eq(eventRegistrations.userId, currentUser.id)
          )
        );
      isUserRegistered = !!registration;
    }

    return NextResponse.json({
      ...event,
      registrationCount,
      spotsRemaining: event.post.eventMaxParticipants 
        ? event.post.eventMaxParticipants - registrationCount 
        : null,
      isFull: event.post.eventMaxParticipants 
        ? registrationCount >= event.post.eventMaxParticipants 
        : false,
      isUserRegistered,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

