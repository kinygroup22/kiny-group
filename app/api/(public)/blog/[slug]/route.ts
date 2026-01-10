// /api/blog/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, blogComments, blogPostViews } from "@/lib/db/schema";
import { eq, and, isNotNull, desc, sql } from "drizzle-orm";
// import { unstable_cache } from "next/cache";
// import { revalidateTag } from "next/cache";

// Cache individual blog post
const getBlogPost = async (slug: string) => {
  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        authorId: blogPosts.authorId,
        category: blogPosts.category,
        readTime: blogPosts.readTime,
        likes: blogPosts.likes,
        views: blogPosts.views,
        commentsCount: blogPosts.commentsCount,
        featured: blogPosts.featured,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        featuredImage: blogPosts.featuredImage,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          eq(blogPosts.slug, slug),
          isNotNull(blogPosts.publishedAt)
        )
      )
      .limit(1);

    if (posts.length === 0) {
      return null;
    }

    const post = posts[0];

    // Get comments for this post
    const comments = await db
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
      .where(eq(blogComments.postId, post.id))
      .orderBy(desc(blogComments.createdAt));

    return {
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      imageUrl: post.featuredImage || '/placeholder-blog.jpg',
      featured: post.featured || false,
      category: post.category || 'Uncategorized',
      readTime: post.readTime ? `${post.readTime} menit baca` : '5 menit baca',
      likes: post.likes || 0,
      views: post.views || 0,
      comments: post.commentsCount || 0,
      date: new Date(post.publishedAt || post.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      author: post.author?.name || 'Admin',
      authorId: post.authorId?.toString(),
      authorImage: post.author?.image,
      createdAt: post.createdAt?.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      commentsList: comments.map(comment => ({
        id: comment.id.toString(),
        content: comment.content,
        parentId: comment.parentId?.toString(),
        author: comment.author?.name || 'Anonymous',
        authorImage: comment.author?.image,
        createdAt: comment.createdAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error("Failed to fetch blog post");
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Unwrap the params promise
    const { slug } = await params;
    
    // Get fresh data (no cache during view increment)
    const post = await getBlogPost(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Track view asynchronously (don't await to avoid blocking response)
    const userIp = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // Track view in background
    (async () => {
      try {
        await db.insert(blogPostViews).values({
          postId: parseInt(post.id),
          ipAddress: userIp,
          userAgent: userAgent,
        });

        await db
          .update(blogPosts)
          .set({ 
            views: sql`${blogPosts.views} + 1`,
          })
          .where(eq(blogPosts.id, parseInt(post.id)));
      } catch (viewError) {
        console.error("Error tracking view:", viewError);
      }
    })();

    // Return the post data immediately (with current like count)
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error in blog post API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}