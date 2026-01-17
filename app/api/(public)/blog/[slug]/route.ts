// app/api/(public)/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, blogComments, blogPostViews, blogCategories, blogPostCategories, eventRegistrations } from "@/lib/db/schema";
import { eq, and, isNotNull, desc, sql, count } from "drizzle-orm";

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
        isEvent: blogPosts.isEvent,
        // Event-specific fields
        eventStartDate: blogPosts.eventStartDate,
        eventEndDate: blogPosts.eventEndDate,
        eventLocation: blogPosts.eventLocation,
        eventMaxParticipants: blogPosts.eventMaxParticipants,
        eventIsActive: blogPosts.eventIsActive,
        eventRegistrationForm: blogPosts.eventRegistrationForm,
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

    // Get categories for this post
    const categories = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
      })
      .from(blogPostCategories)
      .innerJoin(blogCategories, eq(blogPostCategories.categoryId, blogCategories.id))
      .where(eq(blogPostCategories.postId, post.id));

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

    // Get registration count and details if it's an event
    let registrationCount = 0;
    let spotsRemaining = null;
    let isFull = false;
    const isUserRegistered = false;
    
    if (post.isEvent && post.eventIsActive) {
      const [result] = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, post.id));
      
      registrationCount = result.count;
      
      if (post.eventMaxParticipants) {
        spotsRemaining = post.eventMaxParticipants - registrationCount;
        isFull = registrationCount >= post.eventMaxParticipants;
      }
    }

    return {
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      imageUrl: post.featuredImage || '/placeholder-blog.jpg',
      featured: post.featured || false,
      category: post.category || 'Uncategorized',
      categories: categories || [],
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
      // Event fields
      isEvent: post.isEvent || false,
      eventStartDate: post.eventStartDate?.toISOString(),
      eventEndDate: post.eventEndDate?.toISOString(),
      eventLocation: post.eventLocation,
      eventMaxParticipants: post.eventMaxParticipants,
      eventIsActive: post.eventIsActive,
      eventRegistrationForm: post.eventRegistrationForm,
      registrationCount,
      spotsRemaining,
      isFull,
      isUserRegistered,
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