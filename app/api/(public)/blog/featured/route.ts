// app/api/(public)/blog/featured/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache featured posts
const getFeaturedPosts = unstable_cache(
  async (limit: number = 3) => {
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
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt,
          featuredImage: blogPosts.featuredImage,
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(
          and(
            eq(blogPosts.featured, true),
            isNotNull(blogPosts.publishedAt)
          )
        )
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit);

      return posts.map(post => ({
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || post.content?.substring(0, 150) + '...' || '',
        imageUrl: post.featuredImage || '/placeholder-blog.jpg',
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
        authorImage: post.author?.image,
      }));
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      throw new Error("Failed to fetch featured posts");
    }
  },
  ['featured-posts'],
  { revalidate: 3600 }
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "3");

    const posts = await getFeaturedPosts(limit);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error in featured posts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}