// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { requireContributor } from "@/lib/auth";
import { eq, ilike, and, isNull, isNotNull, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const user = await requireContributor();
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      featured = false,
      category,
      readTime = 5,
      published = false,
      isEvent = false,
      // Event fields
      eventStartDate,
      eventEndDate,
      eventLocation,
      eventMaxParticipants,
      eventRegistrationForm,
    } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required." },
        { status: 400 }
      );
    }

    // Validate event fields if isEvent is true
    if (isEvent) {
      if (!eventStartDate) {
        return NextResponse.json(
          { error: "Event start date is required for events." },
          { status: 400 }
        );
      }
      if (!eventEndDate) {
        return NextResponse.json(
          { error: "Event end date is required for events." },
          { status: 400 }
        );
      }
      
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: "Event end date must be after start date." },
          { status: 400 }
        );
      }
      
      if (startDate < new Date()) {
        return NextResponse.json(
          { error: "Event start date cannot be in the past." },
          { status: 400 }
        );
      }
      
      if (eventMaxParticipants && eventMaxParticipants < 1) {
        return NextResponse.json(
          { error: "Maximum participants must be at least 1." },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      );
    }

    // Only admins and editors can publish directly
    const canPublish = user.role === "admin" || user.role === "editor";
    const shouldPublish = published && canPublish;

    // Prepare default registration form for events
    const defaultRegistrationForm = [
      { name: "name", label: "Full Name", type: "text" as const, required: true, placeholder: "Enter your full name" },
      { name: "email", label: "Email", type: "email" as const, required: true, placeholder: "Enter your email" },
      { name: "phone", label: "Phone Number", type: "tel" as const, required: false, placeholder: "Enter your phone number" },
      { name: "age", label: "Age", type: "number" as const, required: true, placeholder: "Enter your age" }
    ];

    // Create the post
    const newPost = await db.insert(blogPosts).values({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      featuredImage: featuredImage || null,
      featured,
      authorId: user.id,
      category: category || null,
      readTime,
      publishedAt: shouldPublish ? new Date() : null,
      isEvent,
      // Event fields
      eventStartDate: isEvent && eventStartDate ? new Date(eventStartDate) : null,
      eventEndDate: isEvent && eventEndDate ? new Date(eventEndDate) : null,
      eventLocation: isEvent && eventLocation ? eventLocation : null,
      eventMaxParticipants: isEvent && eventMaxParticipants ? parseInt(eventMaxParticipants.toString()) : null,
      eventIsActive: isEvent ? true : false,
      eventRegistrationForm: isEvent ? (eventRegistrationForm || defaultRegistrationForm) : defaultRegistrationForm,
    }).returning();

    // Revalidate the posts page
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");
    if (isEvent) {
      revalidatePath("/events");
    }

    return NextResponse.json(
      { 
        message: shouldPublish 
          ? (isEvent ? "Event published successfully" : "Post published successfully")
          : (isEvent ? "Event created successfully" : "Post created successfully"),
        post: newPost[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
}

// GET all posts (for dashboard listing)
export async function GET(request: NextRequest) {
  try {
    const user = await requireContributor();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const published = searchParams.get("published");
    const isEvent = searchParams.get("isEvent");

    const offset = (page - 1) * limit;

    // Build the where conditions
    const conditions = [];
    
    // Contributors can only see their own posts
    if (user.role === "contributor") {
      conditions.push(eq(blogPosts.authorId, user.id));
    }
    
    // Add search filter
    if (search) {
      conditions.push(ilike(blogPosts.title, `%${search}%`));
    }
    
    // Add category filter
    if (category) {
      conditions.push(eq(blogPosts.category, category));
    }
    
    // Add published filter
    if (published !== null) {
      const isPublished = published === "true";
      if (isPublished) {
        conditions.push(isNotNull(blogPosts.publishedAt));
      } else {
        conditions.push(isNull(blogPosts.publishedAt));
      }
    }
    
    // Add event filter
    if (isEvent !== null) {
      const isEventPost = isEvent === "true";
      conditions.push(eq(blogPosts.isEvent, isEventPost));
    }

    // Build the final query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts with pagination
    const posts = await db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(blogPosts.createdAt));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: blogPosts.id })
      .from(blogPosts)
      .where(whereClause);

    const totalCount = totalCountResult.length;

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch posts." },
      { status: 500 }
    );
  }
}