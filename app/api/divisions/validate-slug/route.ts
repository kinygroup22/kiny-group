// app/api/divisions/validate-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandDivisions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, currentId } = body;
    
    if (!slug) {
      return NextResponse.json({ 
        available: false,
        error: "Slug is required" 
      }, { status: 200 });
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { 
          available: false, 
          error: "Slug must contain only lowercase letters, numbers, and hyphens" 
        },
        { status: 200 }
      );
    }
    
    // Check if slug exists in database
    const [existingDivision] = await db
      .select({ id: brandDivisions.id })
      .from(brandDivisions)
      .where(eq(brandDivisions.slug, slug))
      .limit(1);
    
    // If no division found, slug is available
    if (!existingDivision) {
      return NextResponse.json({ available: true }, { status: 200 });
    }
    
    // If editing and slug belongs to current division, it's available
    if (currentId && existingDivision.id === parseInt(currentId)) {
      return NextResponse.json({ available: true }, { status: 200 });
    }
    
    // If slug exists and belongs to another division, it's not available
    return NextResponse.json({ 
      available: false, 
      error: "This slug is already in use" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error validating slug:", error);
    return NextResponse.json(
      { 
        available: false,
        error: "Failed to validate slug" 
      },
      { status: 200 } // Return 200 with error message instead of 500
    );
  }
}