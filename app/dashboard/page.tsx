// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, blogComments, users, brandDivisions } from "@/lib/db/schema";
import { count, sql, gte, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  Users, 
  Building2,
  RefreshCw
} from "lucide-react";
import { Suspense } from "react";
import { ActivityFeed } from "./components/activity-feed";
import { Activity as ActivityType, GroupedActivities } from "./types";

// Format time difference
function formatTimeDiff(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

// Group activities by date
function groupActivitiesByDate(activities: ActivityType[]): GroupedActivities {
  const groups: GroupedActivities = {};
  
  activities.forEach(activity => {
    const date = new Date(activity.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey = '';
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = 'This Week';
    } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      groupKey = 'This Month';
    } else {
      groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
  });
  
  return groups;
}

async function getDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get date for last month comparison
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Fetch all data in parallel
  const [
    totalPosts,
    totalComments,
    totalUsers,
    totalDivisions,
    lastMonthPosts,
    lastMonthComments,
    lastMonthUsers,
    lastMonthDivisions,
    recentPosts,
    recentComments,
    recentUsers,
    recentBrands,
  ] = await Promise.all([
    // Current totals
    db.select({ count: count() }).from(blogPosts),
    db.select({ count: count() }).from(blogComments),
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(brandDivisions),
    
    // Last month counts for comparison
    db.select({ count: count() })
      .from(blogPosts)
      .where(gte(blogPosts.createdAt, lastMonth)),
    db.select({ count: count() })
      .from(blogComments)
      .where(gte(blogComments.createdAt, lastMonth)),
    db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, lastMonth)),
    db.select({ count: count() })
      .from(brandDivisions)
      .where(gte(brandDivisions.createdAt, lastMonth)),

    // Recent activity data
    db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      createdAt: blogPosts.createdAt,
      authorName: users.name,
      authorEmail: users.email,
      published: blogPosts.publishedAt,
    })
      .from(blogPosts)
      .leftJoin(users, sql`${blogPosts.authorId} = ${users.id}`)
      .orderBy(desc(blogPosts.createdAt))
      .limit(20),

    db.select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      authorName: users.name,
      authorEmail: users.email,
      postId: blogComments.postId,
      postTitle: blogPosts.title,
      postSlug: blogPosts.slug,
    })
      .from(blogComments)
      .leftJoin(users, sql`${blogComments.authorId} = ${users.id}`)
      .leftJoin(blogPosts, sql`${blogComments.postId} = ${blogPosts.id}`)
      .orderBy(desc(blogComments.createdAt))
      .limit(20),

    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(20),

    db.select({
      id: brandDivisions.id,
      name: brandDivisions.name,
      createdAt: brandDivisions.updatedAt,
      authorName: users.name,
      authorEmail: users.email,
    })
      .from(brandDivisions)
      .leftJoin(users, sql`${brandDivisions.authorId} = ${users.id}`)
      .orderBy(desc(brandDivisions.updatedAt))
      .limit(20),
  ]);

  // Calculate percentage changes
  const calculateChange = (current: number, lastMonth: number) => {
    if (current === 0) return 0;
    const previous = current - lastMonth;
    if (previous === 0) return 0;
    return Math.round((lastMonth / previous) * 100);
  };

  const statsData = [
    { 
      label: 'Total Posts', 
      value: totalPosts[0].count.toString(), 
      change: calculateChange(totalPosts[0].count, lastMonthPosts[0].count),
      icon: FileText
    },
    { 
      label: 'Comments', 
      value: totalComments[0].count.toLocaleString(), 
      change: calculateChange(totalComments[0].count, lastMonthComments[0].count),
      icon: MessageSquare
    },
    { 
      label: 'Users', 
      value: totalUsers[0].count.toString(), 
      change: calculateChange(totalUsers[0].count, lastMonthUsers[0].count),
      icon: Users
    },
    { 
      label: 'Divisions', 
      value: totalDivisions[0].count.toString(), 
      change: calculateChange(totalDivisions[0].count, lastMonthDivisions[0].count),
      icon: Building2
    },
  ];

  // Combine all activities
  const activities: ActivityType[] = [
    ...recentPosts.map(post => ({
      id: `post-${post.id}`,
      type: 'post' as const,
      action: post.published 
        ? `Published post: "${post.title}"` 
        : `Created draft: "${post.title}"`,
      time: formatTimeDiff(post.createdAt),
      user: post.authorName || post.authorEmail || 'Unknown',
      userEmail: post.authorEmail || undefined, // Convert null to undefined
      createdAt: post.createdAt,
      details: {
        title: post.title,
        slug: post.slug,
        published: post.published
      }
    })),
    ...recentComments.map(comment => ({
      id: `comment-${comment.id}`,
      type: 'comment' as const,
      action: `Commented on "${comment.postTitle}"`,
      time: formatTimeDiff(comment.createdAt),
      user: comment.authorName || comment.authorEmail || 'Unknown',
      userEmail: comment.authorEmail || undefined, // Convert null to undefined
      createdAt: comment.createdAt,
      details: {
        content: comment.content,
        postTitle: comment.postTitle,
        postSlug: comment.postSlug,
        postId: comment.postId
      }
    })),
    ...recentUsers.map(u => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      action: `New user registered: ${u.name || u.email}`,
      time: formatTimeDiff(u.createdAt),
      user: 'System',
      createdAt: u.createdAt,
      details: {
        userName: u.name,
        userEmail: u.email,
        role: u.role
      }
    })),
    ...recentBrands.map(brand => ({
      id: `brand-${brand.id}`,
      type: 'brand' as const,
      action: `Updated brand division: "${brand.name}"`,
      time: formatTimeDiff(brand.createdAt),
      user: brand.authorName || brand.authorEmail || 'Unknown',
      userEmail: brand.authorEmail || undefined, // Convert null to undefined
      createdAt: brand.createdAt,
      details: {
        name: brand.name
      }
    })),
  ];

  // Sort by date
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    user,
    statsData,
    activities,
    groupedActivities: groupActivitiesByDate(activities)
  };
}

export default async function DashboardPage() {
  const { user, statsData, activities, groupedActivities } = await getDashboardData();

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || user.email}!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    stat.change > 0 
                      ? 'bg-green-500' 
                      : stat.change < 0
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`} />
                  <p className={`text-sm ${
                    stat.change > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : stat.change < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}% from last month
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two column grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Profile Information */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{user.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Access Level */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>Access Level</CardTitle>
            <CardDescription>What you can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.role === "admin" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm text-foreground">Full system access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm text-foreground">User management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm text-foreground">Content management</p>
                  </div>
                </>
              )}
              {user.role === "editor" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm text-foreground">Edit all content</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm text-foreground">Publish articles</p>
                  </div>
                </>
              )}
              {user.role === "contributor" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <p className="text-sm text-foreground">Create content</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <p className="text-sm text-foreground">Submit for review</p>
                  </div>
                </>
              )}
              {user.role === "reader" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <p className="text-sm text-foreground">View content</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity with improved UX */}
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading activities...</div>}>
            <ActivityFeed 
              initialActivities={activities} 
              initialGroupedActivities={groupedActivities} 
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}