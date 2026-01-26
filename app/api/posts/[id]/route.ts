// app/api/posts/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogComments, blogPostLikes, blogPostViews, eventRegistrations } from "@/lib/db/schema";
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

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

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
  params: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContributor();
    const { id } = await params.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

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

    // Validate event fields if isEvent is true
    if (body.isEvent) {
      if (!body.eventStartDate) {
        return NextResponse.json(
          { error: "Event start date is required for events." },
          { status: 400 }
        );
      }
      if (!body.eventEndDate) {
        return NextResponse.json(
          { error: "Event end date is required for events." },
          { status: 400 }
        );
      }
      
      const startDate = new Date(body.eventStartDate);
      const endDate = new Date(body.eventEndDate);
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: "Event end date must be after start date." },
          { status: 400 }
        );
      }
      
      if (body.eventMaxParticipants && body.eventMaxParticipants < 1) {
        return NextResponse.json(
          { error: "Maximum participants must be at least 1." },
          { status: 400 }
        );
      }
    }

    // Only admins and editors can publish
    const canPublish = user.role === "admin" || user.role === "editor";
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage || null;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.readTime !== undefined) updateData.readTime = body.readTime;
    if (body.isEvent !== undefined) updateData.isEvent = body.isEvent;

    // Handle event fields
    if (body.isEvent) {
      if (body.eventStartDate !== undefined) {
        updateData.eventStartDate = new Date(body.eventStartDate);
      }
      if (body.eventEndDate !== undefined) {
        updateData.eventEndDate = new Date(body.eventEndDate);
      }
      if (body.eventLocation !== undefined) {
        updateData.eventLocation = body.eventLocation || null;
      }
      if (body.eventMaxParticipants !== undefined) {
        updateData.eventMaxParticipants = body.eventMaxParticipants 
          ? parseInt(body.eventMaxParticipants.toString()) 
          : null;
      }
      if (body.eventIsActive !== undefined) {
        updateData.eventIsActive = body.eventIsActive;
      }
      if (body.eventRegistrationForm !== undefined) {
        updateData.eventRegistrationForm = body.eventRegistrationForm;
      }
    } else if (body.isEvent === false) {
      // If changing from event to regular post, clear event fields
      updateData.eventStartDate = null;
      updateData.eventEndDate = null;
      updateData.eventLocation = null;
      updateData.eventMaxParticipants = null;
      updateData.eventIsActive = false;
    }

    // Handle publishing
    if (body.published !== undefined) {
      if (body.published && canPublish) {
        updateData.publishedAt = existingPost.publishedAt || new Date();
      } else if (!body.published) {
        updateData.publishedAt = null;
      }
      // If user can't publish, ignore the request
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
    if (updatedPost[0].isEvent) {
      revalidatePath("/events");
    }

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
  params: { params: Promise<{ id: string }> }
) {
  return updatePost(request, params);
}

// UPDATE a post (PUT method - for compatibility)
export async function PUT(
  request: NextRequest,
  params: { params: Promise<{ id: string }> }
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

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

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

    // Check if event has registrations
    if (existingPost.isEvent) {
      const registrations = await db
        .select({ count: eventRegistrations.id })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, postId));

      if (registrations.length > 0) {
        return NextResponse.json(
          { 
            error: "Cannot delete event with existing registrations. Please deactivate the event instead.",
            hasRegistrations: true 
          },
          { status: 400 }
        );
      }
    }

    // Delete associated data (cascading deletes will handle most of this, but explicit is better)
    await db.delete(blogComments).where(eq(blogComments.postId, postId));
    await db.delete(blogPostLikes).where(eq(blogPostLikes.postId, postId));
    await db.delete(blogPostViews).where(eq(blogPostViews.postId, postId));
    
    // Delete event registrations if this post is an event
    if (existingPost.isEvent) {
      await db.delete(eventRegistrations).where(eq(eventRegistrations.postId, postId));
    }

    // Delete the post
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");
    if (existingPost.isEvent) {
      revalidatePath("/events");
    }

    return NextResponse.json({
      message: existingPost.isEvent ? "Event deleted successfully" : "Post deleted successfully",
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