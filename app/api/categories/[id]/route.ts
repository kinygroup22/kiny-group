// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET: Fetch a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const category = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT: Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const categoryId = parseInt(id);

    const body = await request.json();

    // Check if category exists
    const existing = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if new slug conflicts with another category
    if (body.slug && body.slug !== existing[0].slug) {
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

    const updatedCategory = await db
      .update(blogCategories)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(blogCategories.id, categoryId))
      .returning();

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");

    return NextResponse.json({
      message: "Category updated successfully",
      category: updatedCategory[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const categoryId = parseInt(id);

    // Check if category exists
    const existing = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, categoryId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // TODO: Check if category has posts associated with it
    // This would require joining with blogPostCategories table

    await db.delete(blogCategories).where(eq(blogCategories.id, categoryId));

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}