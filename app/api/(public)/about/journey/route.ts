/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/(public)/about/journey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journeyItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const items = await db.select()
      .from(journeyItems)
      .orderBy(asc(journeyItems.order), asc(journeyItems.year));
    
    // Transform the data to match the expected format in the component
    const transformedItems = items.map(item => ({
      year: item.year,
      title: item.title,
      description: item.description,
      image: item.imageUrl
    }));
    
    return NextResponse.json(transformedItems);
  } catch (error) {
    console.error("Error fetching journey items:", error);
    return NextResponse.json(
      { error: "Failed to fetch journey items" },
      { status: 500 }
    );
  }
}