/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/posts/page.tsx
import { requireContributor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  FileText,
  CalendarDays,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import PostsTableClient from "@/components/dashboard/posts/PostsTableClient";

// Server component to fetch data
async function getPostsData(user: any) {
  try {
    const { db } = await import("@/lib/db");
    const { blogPosts, users, eventRegistrations } = await import("@/lib/db/schema");
    const { eq, desc, count, sql } = await import("drizzle-orm");
    
    // Fetch all posts with author information
    const postsQuery = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        featured: blogPosts.featured,
        category: blogPosts.category,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        views: blogPosts.views,
        likes: blogPosts.likes,
        commentsCount: blogPosts.commentsCount,
        authorId: blogPosts.authorId,
        authorName: users.name,
        authorEmail: users.email,
        authorImage: users.image,
        isEvent: blogPosts.isEvent,
        // Event fields
        eventStartDate: blogPosts.eventStartDate,
        eventEndDate: blogPosts.eventEndDate,
        eventLocation: blogPosts.eventLocation,
        eventMaxParticipants: blogPosts.eventMaxParticipants,
        eventIsActive: blogPosts.eventIsActive,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .orderBy(desc(blogPosts.createdAt));

    // Get registration counts for events
    const registrationCounts = await db
      .select({
        postId: eventRegistrations.postId,
        count: count(),
      })
      .from(eventRegistrations)
      .groupBy(eventRegistrations.postId);

    // Create a map of registration counts
    const registrationCountMap = new Map(
      registrationCounts.map(r => [r.postId, r.count])
    );

    // Merge registration counts with posts
    const postsWithRegistrations = postsQuery.map(post => ({
      ...post,
      registrationCount: post.isEvent ? (registrationCountMap.get(post.id) || 0) : 0,
    }));

    // Filter posts based on user role
    const filteredPosts = user.role === "contributor" 
      ? postsWithRegistrations.filter(post => post.authorId === user.id)
      : postsWithRegistrations;

    // Calculate total statistics
    const totalStats = filteredPosts.reduce((acc, post) => ({
      views: acc.views + (post.views || 0),
      likes: acc.likes + (post.likes || 0),
      comments: acc.comments + (post.commentsCount || 0),
      published: acc.published + (post.publishedAt ? 1 : 0),
      drafts: acc.drafts + (post.publishedAt ? 0 : 1),
      events: acc.events + (post.isEvent ? 1 : 0),
      activeEvents: acc.activeEvents + (post.isEvent && post.eventIsActive ? 1 : 0),
    }), { views: 0, likes: 0, comments: 0, published: 0, drafts: 0, events: 0, activeEvents: 0 });

    return { posts: filteredPosts, totalStats };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { 
      posts: [], 
      totalStats: { views: 0, likes: 0, comments: 0, published: 0, drafts: 0, events: 0, activeEvents: 0 } 
    };
  }
}

// Main page component (Server Component)
export default async function PostsPage() {
  const user = await requireContributor();
  const { posts, totalStats } = await getPostsData(user);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <DashboardHeader   
          title="Posts Management"
          description="Create, edit and manage your blog posts and events"
          icon={FileText}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Posts</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {posts.length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Published</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {totalStats.published}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Views</p>
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {totalStats.views.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Likes</p>
                <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {totalStats.likes.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Comments</p>
                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                  {totalStats.comments.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-600 dark:bg-yellow-500 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Events</p>
                <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
                  {totalStats.events}
                </h3>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                  {totalStats.activeEvents} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table with Client-Side Pagination and Filtering */}
      <PostsTableClient posts={posts} user={user} />
    </div>
  );
}