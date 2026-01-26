// app/api/dashboard/event-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventRegistrations, blogPosts } from "@/lib/db/schema";
import { count, sql, gte, and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Check permissions - admin, editor, or contributor
    if (!user || (user.role !== "admin" && user.role !== "editor" && user.role !== "contributor")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    
    // Get date for filtering
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    // Get total event registrations
    const totalRegistrations = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(
        user.role === "contributor" 
          ? sql`${eventRegistrations.postId} IN (SELECT id FROM ${blogPosts} WHERE ${blogPosts.authorId} = ${user.id})`
          : undefined
      );

    // Get registrations grouped by date for chart
    const registrationDataRaw = await db
      .select({
        date: sql`DATE(${eventRegistrations.registeredAt})`.as('date'),
        count: count(),
      })
      .from(eventRegistrations)
      .where(
        and(
          gte(eventRegistrations.registeredAt, daysAgo),
          user.role === "contributor" 
            ? sql`${eventRegistrations.postId} IN (SELECT id FROM ${blogPosts} WHERE ${blogPosts.authorId} = ${user.id})`
            : undefined
        )
      )
      .groupBy(sql`DATE(${eventRegistrations.registeredAt})`)
      .orderBy(sql`DATE(${eventRegistrations.registeredAt})`);

    // Get active events count
    const activeEvents = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.isEvent, true),
          eq(blogPosts.eventIsActive, true),
          user.role === "contributor" ? eq(blogPosts.authorId, user.id) : undefined
        )
      );

    // Get total events count
    const totalEvents = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.isEvent, true),
          user.role === "contributor" ? eq(blogPosts.authorId, user.id) : undefined
        )
      );

    // Get registrations by event for potential future use
    const registrationsByEvent = await db
      .select({
        eventId: blogPosts.id,
        eventTitle: blogPosts.title,
        eventSlug: blogPosts.slug,
        count: count(),
      })
      .from(eventRegistrations)
      .innerJoin(blogPosts, eq(eventRegistrations.postId, blogPosts.id))
      .where(
        and(
          eq(blogPosts.isEvent, true),
          user.role === "contributor" ? eq(blogPosts.authorId, user.id) : undefined
        )
      )
      .groupBy(blogPosts.id, blogPosts.title, blogPosts.slug)
      .orderBy(sql`count DESC`);

    // Format the registration data
    const registrationData = registrationDataRaw.map(item => ({
      date: String(item.date),
      count: item.count
    }));

    return NextResponse.json({
      totalRegistrations: totalRegistrations[0].count,
      activeEvents: activeEvents[0].count,
      totalEvents: totalEvents[0].count,
      registrationData,
      registrationsByEvent
    });
  } catch (error) {
    console.error("Error fetching event statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch event statistics" },
      { status: 500 }
    );
  }
}