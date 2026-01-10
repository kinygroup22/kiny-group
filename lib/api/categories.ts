// lib/api/categories.ts
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getCategories() {
  return await db.select().from(blogCategories);
}

export async function getCategory(id: number) {
  const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
  return category;
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
  return category;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [newCategory] = await db
    .insert(blogCategories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
    })
    .returning();

  return newCategory;
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    slug?: string;
    description?: string;
  }
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [updatedCategory] = await db
    .update(blogCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(blogCategories.id, id))
    .returning();

  return updatedCategory;
}

export async function deleteCategory(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Only admins can delete categories
  if (user.role !== "admin") {
    throw new Error("Permission denied");
  }

  await db.delete(blogCategories).where(eq(blogCategories.id, id));
  return { success: true };
}