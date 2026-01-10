// app/dashboard/posts/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, requireContributor } from "@/lib/auth";
import { PostForm } from "@/components/dashboard/post-form";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BlogPost } from "@/lib/db/schema";

// Update the function signature to properly handle params
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing its properties
  const { id } = await params;
  const user = await requireContributor();
  const postId = parseInt(id);

  if (isNaN(postId)) {
    redirect("/dashboard/posts");
  }

  // Fetch the post
  const [dbPost] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId));

  if (!dbPost) {
    notFound();
  }

  // Check if user has permission to edit this post
  // Contributors can only edit their own posts
  if (
    user.role === "contributor" && 
    dbPost.authorId !== user.id
  ) {
    redirect("/dashboard/posts");
  }

  // Ensure the post has all required properties according to the schema
  const post: BlogPost = {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    excerpt: dbPost.excerpt || null,
    content: dbPost.content,
    featuredImage: dbPost.featuredImage || null,
    featured: dbPost.featured || false,
    createdAt: dbPost.createdAt,
    updatedAt: dbPost.updatedAt,
    authorId: dbPost.authorId,
    publishedAt: dbPost.publishedAt || null,
    category: dbPost.category || null,
    readTime: dbPost.readTime || 5,
    views: dbPost.views || 0,
    likes: dbPost.likes || 0,
    commentsCount: dbPost.commentsCount || 0,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Post</h1>
        <p className="text-muted-foreground">Update your blog post</p>
      </div>

      <PostForm user={user} post={post} />
    </div>
  );
}