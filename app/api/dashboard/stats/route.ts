// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogComments, users, brandDivisions } from "@/lib/db/schema";
import { count, sql, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get date for last month comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get total counts
    const [
      totalPosts,
      totalComments,
      totalUsers,
      totalDivisions,
      lastMonthPosts,
      lastMonthComments,
      lastMonthUsers,
      lastMonthDivisions,
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
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, lastMonth: number) => {
      if (current === 0) return 0;
      const previous = current - lastMonth;
      if (previous === 0) return 0;
      return Math.round((lastMonth / previous) * 100);
    };

    const stats = {
      totalPosts: {
        value: totalPosts[0].count,
        change: calculateChange(totalPosts[0].count, lastMonthPosts[0].count),
      },
      totalComments: {
        value: totalComments[0].count,
        change: calculateChange(totalComments[0].count, lastMonthComments[0].count),
      },
      totalUsers: {
        value: totalUsers[0].count,
        change: calculateChange(totalUsers[0].count, lastMonthUsers[0].count),
      },
      totalDivisions: {
        value: totalDivisions[0].count,
        change: calculateChange(totalDivisions[0].count, lastMonthDivisions[0].count),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}