// app/api/(public)/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, and, isNotNull, desc, ilike, or, SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache blog posts data for better performance
const getBlogPosts = unstable_cache(
  async (category?: string, search?: string, limit?: number, offset?: number) => {
    try {
      // Build the where conditions
      const conditions: SQL[] = [isNotNull(blogPosts.publishedAt)];
      
      // Filter by category if provided
      if (category && category !== "Semua") {
        conditions.push(eq(blogPosts.category, category));
      }

      // Search functionality
      if (search) {
        const searchCondition = or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.excerpt, `%${search}%`),
          ilike(users.name, `%${search}%`),
          ilike(blogPosts.category, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Build and execute the query
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
        .where(and(...conditions))
        .orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt))
        .limit(limit || 10)
        .offset(offset || 0);

      // Format response to match frontend expectations
      return posts.map(post => ({
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || post.content?.substring(0, 150) + '...' || '',
        content: post.content,
        // Add cache-busting parameter to image URLs
        imageUrl: post.featuredImage 
          ? `${post.featuredImage}${post.featuredImage.includes('?') ? '&' : '?'}t=${post.updatedAt?.getTime() || Date.now()}` 
          : '/placeholder-blog.jpg',
        featured: post.featured || false,
        category: post.category || 'Uncategorized',
        readTime: post.readTime ? `${post.readTime} menit baca` : '5 menit baca',
        likes: post.likes || 0,
        comments: post.commentsCount || 0,
        date: new Date(post.publishedAt || post.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        author: post.author?.name || 'Admin',
        authorId: post.authorId?.toString(),
        createdAt: post.createdAt?.toISOString(),
        updatedAt: post.updatedAt?.toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw new Error("Failed to fetch blog posts");
    }
  },
  ['blog-posts'],
  { revalidate: 300 } // Reduced cache time to 5 minutes
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Add cache control headers to prevent browser caching
    const posts = await getBlogPosts(category, search, limit, offset);

    return new NextResponse(JSON.stringify(posts), {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes cache
        'Stale-While-Revalidate': '600', // Serve stale content for 10 minutes while revalidating
      }
    });
  } catch (error) {
    console.error("Error in blog posts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}