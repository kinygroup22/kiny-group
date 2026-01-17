// ==========================================
// app/api/events/[id]/register/route.ts
// ==========================================

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// POST - Register for an event
export async function POST(
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

    const body = await request.json();
    const { registrationData } = body;

    if (!registrationData) {
      return NextResponse.json(
        { error: "Registration data is required" },
        { status: 400 }
      );
    }

    // Get current user (optional - can be null for guest registrations)
    const currentUser = await getCurrentUser();

    // Validate the event
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

    if (!post.eventIsActive) {
      return NextResponse.json(
        { error: "Event registration is closed" },
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

    // Check if event is full
    if (post.eventMaxParticipants) {
      const [{ count: registrationCount }] = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, postId));

      if (registrationCount >= post.eventMaxParticipants) {
        return NextResponse.json(
          { error: "Event is full" },
          { status: 400 }
        );
      }
    }

    // Check if user is already registered (if logged in)
    if (currentUser) {
      const [existingRegistration] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.postId, postId),
            eq(eventRegistrations.userId, currentUser.id)
          )
        );

      if (existingRegistration) {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        );
      }
    }

    // Validate required fields based on event's registration form
    const form = post.eventRegistrationForm as Array<{
      name: string;
      required: boolean;
    }>;

    for (const field of form) {
      if (field.required && !registrationData[field.name]) {
        return NextResponse.json(
          { error: `${field.name} is required` },
          { status: 400 }
        );
      }
    }

    // Create the registration
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values({
        postId,
        userId: currentUser?.id || null,
        registrationData,
      })
      .returning();

    // Revalidate paths
    revalidatePath("/events");
    revalidatePath(`/events/${post.slug}`);
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json(
      {
        message: "Registration successful!",
        registration: newRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

