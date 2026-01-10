// app/api/(public)/brand/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandDivisions, brandDivisionImages, brandActivities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params Promise
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    // Get the division
    const division = await db.select()
      .from(brandDivisions)
      .where(eq(brandDivisions.id, idNum))
      .limit(1);

    if (!division || division.length === 0) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }

    // Get the division images
    const images = await db.select()
      .from(brandDivisionImages)
      .where(eq(brandDivisionImages.brandDivisionId, idNum))
      .orderBy(brandDivisionImages.order);

    // Get the division activities
    const activities = await db.select()
      .from(brandActivities)
      .where(eq(brandActivities.brandDivisionId, idNum))
      .orderBy(brandActivities.order);

    // Combine division with images and activities
    const divisionWithData = {
      ...division[0],
      images: images,
      activities: activities
    };

    return NextResponse.json(divisionWithData);
  } catch (error) {
    console.error("Error fetching brand division:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand division" },
      { status: 500 }
    );
  }
}