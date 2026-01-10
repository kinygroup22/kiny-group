// lib/api/posts.ts
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getPosts() {
  return await db.select().from(blogPosts);
}

export async function getPost(id: number) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return post;
}

export async function getPostBySlug(slug: string) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  return post;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured?: boolean;
  category?: string;
  readTime?: number;
  published?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [newPost] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured: data.featured || false,
      category: data.category,
      readTime: data.readTime || 5,
      publishedAt: data.published ? new Date() : null,
      authorId: user.id,
    })
    .returning();

  return newPost;
}

export async function updatePost(
  id: number,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured?: boolean;
    category?: string;
    readTime?: number;
    published?: boolean;
  }
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Check if user has permission to edit this post
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!post) {
    throw new Error("Post not found");
  }

  // Contributors can only edit their own posts
  if (
    user.role === "contributor" && 
    post.authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  const [updatedPost] = await db
    .update(blogPosts)
    .set({
      ...data,
      publishedAt: data.published !== undefined 
        ? (data.published ? new Date() : null) 
        : post.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();

  return updatedPost;
}

export async function deletePost(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Only admins and editors can delete posts
  if (user.role !== "admin" && user.role !== "editor") {
    throw new Error("Permission denied");
  }

  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return { success: true };
}

