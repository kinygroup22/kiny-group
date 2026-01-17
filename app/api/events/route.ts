// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, eventRegistrations } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, count } from "drizzle-orm";

// GET all events (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "active"; // active, upcoming, past, all

    const now = new Date();
    const whereConditions = [
      eq(blogPosts.isEvent, true),
    ];

    // Filter based on type
    switch (type) {
      case "active":
        whereConditions.push(
          eq(blogPosts.eventIsActive, true),
          gte(blogPosts.eventEndDate, now)
        );
        break;
      case "upcoming":
        whereConditions.push(
          eq(blogPosts.eventIsActive, true),
          gte(blogPosts.eventStartDate, now)
        );
        break;
      case "past":
        whereConditions.push(
          lte(blogPosts.eventEndDate, now)
        );
        break;
      case "all":
        // No additional filters
        break;
    }

    const events = await db
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
      .where(and(...whereConditions))
      .orderBy(desc(blogPosts.eventStartDate));

    // Get registration counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const [{ count: registrationCount }] = await db
          .select({ count: count() })
          .from(eventRegistrations)
          .where(eq(eventRegistrations.postId, event.post.id));

        return {
          ...event,
          registrationCount,
          spotsRemaining: event.post.eventMaxParticipants 
            ? event.post.eventMaxParticipants - registrationCount 
            : null,
          isFull: event.post.eventMaxParticipants 
            ? registrationCount >= event.post.eventMaxParticipants 
            : false,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCounts });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

