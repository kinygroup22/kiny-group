// app/api/(public)/brand/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandDivisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");

    let divisions;

    if (featured === "true") {
      divisions = await db
        .select()
        .from(brandDivisions)
        .where(eq(brandDivisions.featured, true))
        .orderBy(asc(brandDivisions.order));
    } else {
      divisions = await db
        .select()
        .from(brandDivisions)
        .orderBy(asc(brandDivisions.order));
    }

    return NextResponse.json(divisions);
  } catch (error) {
    console.error("Error fetching brand divisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand divisions" },
      { status: 500 }
    );
  }
}