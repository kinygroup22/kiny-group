/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/achievements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

// POST: Create a new achievement
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newAchievement = await db
      .insert(achievements)
      .values({
        title: body.title,
        description: body.description || "",
        icon: body.icon || "",
        order: body.order || 0,
        featured: body.featured || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/achievements");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Achievement created successfully",
      achievement: newAchievement[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create achievement." },
      { status: 500 }
    );
  }
}