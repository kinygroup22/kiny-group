/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// POST: Create a new category
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

    // Check if slug already exists
    if (body.slug) {
      const slugExists = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, body.slug))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const newCategory = await db
      .insert(blogCategories)
      .values({
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");

    return NextResponse.json({
      message: "Category created successfully",
      category: newCategory[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}

// GET: Fetch all categories
export async function GET() {
  try {
    const categories = await db.select().from(blogCategories).orderBy(blogCategories.name);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}