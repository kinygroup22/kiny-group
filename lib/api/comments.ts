// lib/api/comments.ts
import { db } from "@/lib/db";
import { blogComments, blogPosts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// Get all comments with post and author info
export async function getComments() {
  return await db
    .select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      postId: blogComments.postId,
      authorId: blogComments.authorId,
    })
    .from(blogComments)
    .orderBy(desc(blogComments.createdAt));
}

// Get a single comment
export async function getComment(id: number) {
  const [comment] = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, id));
  return comment;
}

// Delete a comment
export async function deleteComment(id: number) {
  // Check if comment exists
  const [existingComment] = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, id));

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  // Get the post to update comment count
  const postId = existingComment.postId;

  // Delete the comment
  await db.delete(blogComments).where(eq(blogComments.id, id));

  // Update the post's comment count
  const [commentCount] = await db
    .select({ count: blogComments.id })
    .from(blogComments)
    .where(eq(blogComments.postId, postId));

  await db
    .update(blogPosts)
    .set({ commentsCount: commentCount?.count || 0 })
    .where(eq(blogPosts.id, postId));

  return { success: true };
}

// Create a reply to a comment
export async function createReply(data: {
  postId: number;
  authorId: number;
  content: string;
  parentId: number;
}) {
  const [newComment] = await db
    .insert(blogComments)
    .values({
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      parentId: data.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Update the post's comment count
  const [commentCount] = await db
    .select({ count: blogComments.id })
    .from(blogComments)
    .where(eq(blogComments.postId, data.postId));

  await db
    .update(blogPosts)
    .set({ commentsCount: commentCount?.count || 0 })
    .where(eq(blogPosts.id, data.postId));

  return newComment;
}