// app/api/categories/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingCategory = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    return NextResponse.json({
      available: existingCategory.length === 0,
    });
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}