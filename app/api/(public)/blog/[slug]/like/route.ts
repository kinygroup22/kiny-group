// app/api/(public)/blog/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogPostLikes } from "@/lib/db/schema";
import { eq, and, sql, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to get a unique identifier for anonymous users
function getAnonymousId(request: NextRequest): string {
  // Use IP address and user agent to create a pseudo-unique ID
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  // Create a simple hash-like identifier
  return `anon_${Buffer.from(ip + userAgent).toString('base64').substring(0, 20)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Get post by slug
    const posts = await db
      .select({ id: blogPosts.id, likes: blogPosts.likes })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const postId = posts[0].id;
    let userId: number | null = null;
    let anonymousId: string | null = null;

    // Determine if user is authenticated or anonymous
    if (session?.user?.id) {
      userId = parseInt(session.user.id);
    } else {
      // Get anonymous identifier from request body or generate from request
      const body = await request.json().catch(() => ({}));
      anonymousId = body.anonymousId || getAnonymousId(request);
    }

    // Check if this user/anonymous user already liked this post
    let existingLikes;
    
    if (userId) {
      // Check for authenticated user
      existingLikes = await db
        .select()
        .from(blogPostLikes)
        .where(
          and(
            eq(blogPostLikes.postId, postId),
            eq(blogPostLikes.userId, userId)
          )
        )
        .limit(1);
    } else {
      // Check for anonymous user by anonymousId
      existingLikes = await db
        .select()
        .from(blogPostLikes)
        .where(
          and(
            eq(blogPostLikes.postId, postId),
            sql`${blogPostLikes.anonymousId} = ${anonymousId}`
          )
        )
        .limit(1);
    }

    let newLikeCount: number;

    if (existingLikes.length > 0) {
      // Unlike: Remove like and decrement count
      if (userId) {
        await db
          .delete(blogPostLikes)
          .where(
            and(
              eq(blogPostLikes.postId, postId),
              eq(blogPostLikes.userId, userId)
            )
          );
      } else {
        await db
          .delete(blogPostLikes)
          .where(
            and(
              eq(blogPostLikes.postId, postId),
              sql`${blogPostLikes.anonymousId} = ${anonymousId}`
            )
          );
      }

      const updatedPost = await db
        .update(blogPosts)
        .set({ 
          likes: sql`GREATEST(${blogPosts.likes} - 1, 0)`,
        })
        .where(eq(blogPosts.id, postId))
        .returning({ likes: blogPosts.likes });

      newLikeCount = updatedPost[0]?.likes || 0;

      return NextResponse.json({ 
        liked: false, 
        likes: newLikeCount,
        anonymousId: anonymousId,
        message: "Post unliked successfully" 
      });
    } else {
      // Like: Add like and increment count
      if (userId) {
        await db.insert(blogPostLikes).values({
          postId,
          userId,
          anonymousId: null,
        });
      } else {
        await db.insert(blogPostLikes).values({
          postId,
          userId: null,
          anonymousId: anonymousId,
        });
      }

      const updatedPost = await db
        .update(blogPosts)
        .set({ 
          likes: sql`${blogPosts.likes} + 1`,
        })
        .where(eq(blogPosts.id, postId))
        .returning({ likes: blogPosts.likes });

      newLikeCount = updatedPost[0]?.likes || 0;

      return NextResponse.json({ 
        liked: true, 
        likes: newLikeCount,
        anonymousId: anonymousId,
        message: "Post liked successfully" 
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has liked a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Get post by slug
    const posts = await db
      .select({ id: blogPosts.id, likes: blogPosts.likes })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ 
        liked: false,
        likes: 0 
      });
    }

    const postId = posts[0].id;
    let userId: number | null = null;
    let anonymousId: string | null = null;

    // Determine if user is authenticated or anonymous
    if (session?.user?.id) {
      userId = parseInt(session.user.id);
    } else {
      anonymousId = getAnonymousId(request);
    }

    // Check if user/anonymous user liked this post
    let existingLikes;
    
    if (userId) {
      existingLikes = await db
        .select()
        .from(blogPostLikes)
        .where(
          and(
            eq(blogPostLikes.postId, postId),
            eq(blogPostLikes.userId, userId)
          )
        )
        .limit(1);
    } else {
      existingLikes = await db
        .select()
        .from(blogPostLikes)
        .where(
          and(
            eq(blogPostLikes.postId, postId),
            sql`${blogPostLikes.anonymousId} = ${anonymousId}`
          )
        )
        .limit(1);
    }

    return NextResponse.json({ 
      liked: existingLikes.length > 0,
      likes: posts[0].likes,
      anonymousId: anonymousId
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json({ 
      liked: false,
      likes: 0 
    });
  }
}