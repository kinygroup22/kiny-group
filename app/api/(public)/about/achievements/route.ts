/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/(public)/about/achievements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch all achievements
export async function GET() {
  try {
    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.order);
    
    return NextResponse.json(allAchievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}