// app/api/(public)/blog/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { isNotNull, sql, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache categories data
const getCategories = unstable_cache(
  async () => {
    try {
      // Get all unique categories from published posts
      const categories = await db
        .select({
          category: blogPosts.category,
          count: sql<number>`count(*)::int`,
        })
        .from(blogPosts)
        .where(isNotNull(blogPosts.publishedAt))
        .groupBy(blogPosts.category)
        .orderBy(desc(sql`count(*)`));

      // Format response
      return [
        {
          name: "Semua",
          slug: "semua",
          count: categories.reduce((sum, cat) => sum + cat.count, 0),
        },
        ...categories
          .filter(cat => cat.category)
          .map(cat => ({
            name: cat.category!,
            slug: cat.category!.toLowerCase().replace(/\s+/g, '-'),
            count: cat.count,
          }))
      ];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  },
  ['blog-categories'],
  { revalidate: 3600 }
);

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error in categories API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}