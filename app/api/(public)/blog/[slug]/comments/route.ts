// app/api/(public)/blog/[slug]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogComments, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Adjust path as needed

// GET comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Unwrap the params promise
    const { slug } = await params;

    // Get post by slug
    const posts = await db
      .select({ id: blogPosts.id })
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

    // Get all comments for this post
    const comments = await db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        parentId: blogComments.parentId,
        createdAt: blogComments.createdAt,
        updatedAt: blogComments.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.authorId, users.id))
      .where(eq(blogComments.postId, postId))
      .orderBy(desc(blogComments.createdAt));

    // Format comments
    const formattedComments = comments.map(comment => ({
      id: comment.id.toString(),
      content: comment.content,
      parentId: comment.parentId?.toString(),
      author: comment.author?.name || 'Anonymous',
      authorImage: comment.author?.image,
      createdAt: comment.createdAt?.toISOString(),
      updatedAt: comment.updatedAt?.toISOString(),
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Unwrap the params promise
    const { slug } = await params;
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Get post by slug
    const posts = await db
      .select({ id: blogPosts.id })
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

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentComments = await db
        .select()
        .from(blogComments)
        .where(eq(blogComments.id, parseInt(parentId)))
        .limit(1);

      if (parentComments.length === 0) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Insert the comment
    const newComments = await db
      .insert(blogComments)
      .values({
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parentId ? parseInt(parentId) : null,
      })
      .returning();

    // Update comment count
    await db
      .update(blogPosts)
      .set({ 
        commentsCount: sql`${blogPosts.commentsCount} + 1`,
      })
      .where(eq(blogPosts.id, postId));

    // Get the comment with author info
    const commentWithAuthor = await db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        parentId: blogComments.parentId,
        createdAt: blogComments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.authorId, users.id))
      .where(eq(blogComments.id, newComments[0].id))
      .limit(1);

    const comment = commentWithAuthor[0];

    return NextResponse.json({
      comment: {
        id: comment.id.toString(),
        content: comment.content,
        parentId: comment.parentId?.toString(),
        author: comment.author?.name || 'Anonymous',
        authorImage: comment.author?.image,
        createdAt: comment.createdAt?.toISOString(),
      },
      message: "Comment posted successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}