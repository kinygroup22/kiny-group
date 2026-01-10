/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/journey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journeyItems } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET: Fetch all journey items
export async function GET() {
  try {
    const allItems = await db
      .select()
      .from(journeyItems)
      .orderBy(journeyItems.order);
    
    return NextResponse.json(allItems);
  } catch (error) {
    console.error("Error fetching journey items:", error);
    return NextResponse.json(
      { error: "Failed to fetch journey items" },
      { status: 500 }
    );
  }
}

// POST: Create a new journey item
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

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

    const newItem = await db
      .insert(journeyItems)
      .values({
        year: body.year,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        order: body.order || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/journey");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Journey item created successfully",
      item: newItem[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating journey item:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create journey item." },
      { status: 500 }
    );
  }
}