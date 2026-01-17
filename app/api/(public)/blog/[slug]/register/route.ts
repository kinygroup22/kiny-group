// app/api/(public)/blog/[slug]/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations, users } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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

    if (!post.isEvent) {
      return NextResponse.json(
        { error: "This post is not an event" },
        { status: 400 }
      );
    }

    if (!post.eventIsActive) {
      return NextResponse.json(
        { error: "Event is no longer active" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (post.eventEndDate && post.eventEndDate < now) {
      return NextResponse.json(
        { error: "Event has already ended" },
        { status: 400 }
      );
    }

    // Get registration data from request
    const registrationData = await request.json();

    // Get current user if authenticated
    const user = await getCurrentUser();
    const userId = user?.id;

    // Check if event is full
    if (post.eventMaxParticipants) {
      const [result] = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, post.id));

      if (result.count >= post.eventMaxParticipants) {
        return NextResponse.json(
          { error: "Event has reached maximum participants" },
          { status: 400 }
        );
      }
    }

    // Check if user is already registered
    if (userId) {
      const [existingRegistration] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.postId, post.id),
            eq(eventRegistrations.userId, userId)
          )
        );

      if (existingRegistration) {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        );
      }
    }

    // Create registration
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values({
        postId: post.id,
        userId: userId,
        registrationData,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      registrationId: newRegistration.id 
    });
  } catch (error) {
    console.error("Error in event registration API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}