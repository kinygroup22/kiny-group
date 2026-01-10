import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CategoryForm } from "@/components/dashboard/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const categoryId = parseInt(id);

  // Fetch the category
  const categories = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, categoryId))
    .limit(1);

  if (categories.length === 0) {
    notFound();
  }

  const category = categories[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{category.name}&quot;
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}