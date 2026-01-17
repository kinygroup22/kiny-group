// app/api/dashboard/event-registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventRegistrations, blogPosts, users } from "@/lib/db/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Check permissions - admin, editor, or event author
    if (!user || (user.role !== "admin" && user.role !== "editor" && user.role !== "contributor")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventFilter = searchParams.get("event"); // Event slug or "all"
    const search = searchParams.get("search"); // Search term

    // Build base query
    let query = db
      .select({
        registration: eventRegistrations,
        event: {
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          eventStartDate: blogPosts.eventStartDate,
          eventEndDate: blogPosts.eventEndDate,
          eventLocation: blogPosts.eventLocation,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(eventRegistrations)
      .innerJoin(blogPosts, eq(eventRegistrations.postId, blogPosts.id))
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .$dynamic();

    // Apply filters
    const conditions = [eq(blogPosts.isEvent, true)];

    // Filter by event
    if (eventFilter && eventFilter !== "all") {
      conditions.push(eq(blogPosts.slug, eventFilter));
    }

    // Filter by author for contributors
    if (user.role === "contributor") {
      conditions.push(eq(blogPosts.authorId, user.id));
    }

    // Apply search filter
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${users.name}) LIKE ${searchLower}`,
          sql`LOWER(${users.email}) LIKE ${searchLower}`,
          sql`LOWER(CAST(${eventRegistrations.registrationData} AS TEXT)) LIKE ${searchLower}`
        )!
      );
    }

    query = query.where(and(...conditions));

    // Execute query with ordering
    const registrations = await query.orderBy(desc(eventRegistrations.registeredAt));

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const { registrationId } = await request.json();

    await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}