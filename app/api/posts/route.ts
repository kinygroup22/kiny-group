// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { requireContributor } from "@/lib/auth";
import { eq, ilike, and, or, isNull, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Check if user has permission to create posts
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
    } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required." },
        { status: 400 }
      );
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
    }).returning();

    // Revalidate the posts page
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");

    return NextResponse.json(
      { 
        message: shouldPublish ? "Post published successfully" : "Post created successfully",
        post: newPost[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    
    // Handle auth errors specifically
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

    // Build the final query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts with pagination
    const posts = await db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(blogPosts.createdAt);

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
    
    // Handle auth errors specifically
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