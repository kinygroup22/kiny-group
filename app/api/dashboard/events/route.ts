// app/api/dashboard/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations } from "@/lib/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "admin" && user.role !== "editor" && user.role !== "contributor")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Build query based on user role
    let query = db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        eventStartDate: blogPosts.eventStartDate,
        eventEndDate: blogPosts.eventEndDate,
        eventLocation: blogPosts.eventLocation,
        eventMaxParticipants: blogPosts.eventMaxParticipants,
        eventIsActive: blogPosts.eventIsActive,
      })
      .from(blogPosts)
      .$dynamic();

    // Filter by event type
    const conditions = [eq(blogPosts.isEvent, true)];

    // Contributors can only see their own events
    if (user.role === "contributor") {
      conditions.push(eq(blogPosts.authorId, user.id));
    }

    query = query.where(and(...conditions));

    const events = await query.orderBy(desc(blogPosts.eventStartDate));

    // Get registration counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const [result] = await db
          .select({ count: count() })
          .from(eventRegistrations)
          .where(eq(eventRegistrations.postId, event.id));

        return {
          ...event,
          registrationCount: result.count,
        };
      })
    );

    return NextResponse.json(eventsWithCounts);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}