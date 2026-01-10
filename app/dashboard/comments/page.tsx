// app/dashboard/comments/page.tsx
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogComments, blogPosts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CommentsClient } from "@/components/dashboard/comments-client";

export default async function CommentsPage() {
  const user = await requireEditor();

  // Fetch all comments with post and author information
  const rawComments = await db
    .select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      postId: blogComments.postId,
      postTitle: blogPosts.title,
      postSlug: blogPosts.slug,
      authorName: users.name,
      authorEmail: users.email,
      parentId: blogComments.parentId,
    })
    .from(blogComments)
    .leftJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
    .leftJoin(users, eq(blogComments.authorId, users.id))
    .orderBy(desc(blogComments.createdAt));

  // Ensure the data types match the expected Comment type
  const comments = rawComments.map(comment => ({
    ...comment,
    id: Number(comment.id),
    postId: Number(comment.postId),
    parentId: comment.parentId ? Number(comment.parentId) : null,
  }));

  return <CommentsClient comments={comments} userRole={user.role} />;
}