/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogComments, blogPostLikes, blogPostViews } from "@/lib/db/schema";
import { requireContributor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContributor();
    const { id } = await params;
    const postId = parseInt(id);

    const post = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Contributors can only access their own posts
    if (user.role === "contributor" && post[0].authorId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this post" },
        { status: 403 }
      );
    }

    return NextResponse.json(post[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Shared update logic for both PATCH and PUT
async function updatePost(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const user = await requireContributor();
    const { id } = await params;
    const postId = parseInt(id);

    const body = await request.json();

    // Get the existing post
    const existingPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const existingPost = existingPosts[0];

    // Contributors can only edit their own posts
    if (user.role === "contributor" && existingPost.authorId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this post" },
        { status: 403 }
      );
    }

    // Check if new slug conflicts with another post
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, body.slug))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Only admins and editors can publish
    const canPublish = user.role === "admin" || user.role === "editor";
    
    // Prepare update data
    const updateData: any = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content,
      featuredImage: body.featuredImage || null,
      featured: body.featured || false,
      category: body.category || null,
      readTime: body.readTime || 5,
      updatedAt: new Date(),
    };

    // Handle publishing
    if (body.published !== undefined) {
      if (body.published && canPublish) {
        updateData.publishedAt = existingPost.publishedAt || new Date();
      } else if (!body.published) {
        updateData.publishedAt = null;
      } else {
        // Keep existing publishedAt if user can't publish
        updateData.publishedAt = existingPost.publishedAt;
      }
    } else {
      // Keep existing publishedAt if not specified
      updateData.publishedAt = existingPost.publishedAt;
    }

    // Update the post
    const updatedPost = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, postId))
      .returning();

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");
    revalidatePath(`/blog/${updatedPost[0].slug}`);

    return NextResponse.json({
      message: "Post updated successfully",
      post: updatedPost[0],
    });
  } catch (error) {
    console.error("Error updating post:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// UPDATE a post (PATCH method)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updatePost(request, params);
}

// UPDATE a post (PUT method - for compatibility)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updatePost(request, params);
}

// DELETE a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContributor();
    const { id } = await params;
    const postId = parseInt(id);

    // Get the existing post
    const existingPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const existingPost = existingPosts[0];

    // Only admins, editors, or the author can delete
    const canDelete = 
      user.role === "admin" || 
      user.role === "editor" || 
      existingPost.authorId === user.id;

    if (!canDelete) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 }
      );
    }

    // Delete associated data (comments, likes, views)
    await db.delete(blogComments).where(eq(blogComments.postId, postId));
    await db.delete(blogPostLikes).where(eq(blogPostLikes.postId, postId));
    await db.delete(blogPostViews).where(eq(blogPostViews.postId, postId));

    // Delete the post
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}