/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/achievements/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

// GET: Fetch a single achievement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const achievementId = parseInt(id);
    
    if (isNaN(achievementId)) {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 });
    }

    const achievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    return NextResponse.json(achievement[0]);
  } catch (error) {
    console.error("Error fetching achievement:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievement" },
      { status: 500 }
    );
  }
}

// PUT: Update an achievement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const achievementId = parseInt(id);

    if (isNaN(achievementId)) {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if achievement exists
    const existing = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const updatedAchievement = await db
      .update(achievements)
      .set({
        title: body.title,
        description: body.description || "",
        icon: body.icon || "",
        order: body.order || 0,
        featured: body.featured || false,
        updatedAt: new Date(),
      })
      .where(eq(achievements.id, achievementId))
      .returning();

    revalidatePath("/dashboard/achievements");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Achievement updated successfully",
      achievement: updatedAchievement[0],
    });
  } catch (error) {
    console.error("Error updating achievement:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update achievement." },
      { status: 500 }
    );
  }
}

// DELETE: Delete an achievement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await requireAdmin();
    const { id } = await params;
    const achievementId = parseInt(id);

    if (isNaN(achievementId)) {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 });
    }

    // Check if achievement exists
    const existing = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    await db.delete(achievements).where(eq(achievements.id, achievementId));

    return NextResponse.json({ 
      success: true, 
      message: "Achievement deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete achievement." },
      { status: 500 }
    );
  }
}