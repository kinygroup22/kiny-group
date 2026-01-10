/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/journey/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journeyItems } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET: Fetch a single journey item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid journey item ID" }, { status: 400 });
    }

    const item = await db
      .select()
      .from(journeyItems)
      .where(eq(journeyItems.id, itemId))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json({ error: "Journey item not found" }, { status: 404 });
    }

    return NextResponse.json(item[0]);
  } catch (error) {
    console.error("Error fetching journey item:", error);
    return NextResponse.json(
      { error: "Failed to fetch journey item" },
      { status: 500 }
    );
  }
}

// PUT: Update a journey item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid journey item ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if journey item exists
    const existing = await db
      .select()
      .from(journeyItems)
      .where(eq(journeyItems.id, itemId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Journey item not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.year || !body.title || !body.description || !body.imageUrl) {
      return NextResponse.json(
        { error: "Year, title, description, and image URL are required" },
        { status: 400 }
      );
    }

    // Validate imageUrl format
    if (!/^https?:\/\/.+\..+/.test(body.imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL format" },
        { status: 400 }
      );
    }

    const updatedItem = await db
      .update(journeyItems)
      .set({
        year: body.year,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        order: body.order || 0,
        updatedAt: new Date(),
      })
      .where(eq(journeyItems.id, itemId))
      .returning();

    revalidatePath("/dashboard/journey");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Journey item updated successfully",
      item: updatedItem[0],
    });
  } catch (error) {
    console.error("Error updating journey item:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update journey item." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a journey item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid journey item ID" }, { status: 400 });
    }

    // Check if journey item exists
    const existing = await db
      .select()
      .from(journeyItems)
      .where(eq(journeyItems.id, itemId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Journey item not found" }, { status: 404 });
    }

    await db.delete(journeyItems).where(eq(journeyItems.id, itemId));

    revalidatePath("/dashboard/journey");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Journey item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting journey item:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete journey item." },
      { status: 500 }
    );
  }
}