// app/api/(public)/brand/slug/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandDivisions, brandDivisionImages, brandActivities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params; // Await the params Promise
    
    // Get the division by slug
    const division = await db.select()
      .from(brandDivisions)
      .where(eq(brandDivisions.slug, slug))
      .limit(1);

    if (!division || division.length === 0) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }

    // Get the division images
    const images = await db.select()
      .from(brandDivisionImages)
      .where(eq(brandDivisionImages.brandDivisionId, division[0].id))
      .orderBy(brandDivisionImages.order);

    // Get the division activities
    const activities = await db.select()
      .from(brandActivities)
      .where(eq(brandActivities.brandDivisionId, division[0].id))
      .orderBy(brandActivities.order);

    // Combine division with images and activities
    const divisionWithData = {
      ...division[0],
      images: images,
      activities: activities
    };

    return NextResponse.json(divisionWithData);
  } catch (error) {
    console.error("Error fetching brand division by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand division" },
      { status: 500 }
    );
  }
}