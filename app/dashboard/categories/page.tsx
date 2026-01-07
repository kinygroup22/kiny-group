// app/dashboard/categories/page.tsx
import {  requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Folder } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DeleteCategoryButton } from "@/components/dashboard/delete-category-button";

export default async function CategoriesPage() {
  const user = await requireEditor();

  // Fetch all categories
  const categories = await db
    .select()
    .from(blogCategories)
    .orderBy(blogCategories.name);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <DashboardHeader 
          title="Categories"
          description="Manage blog post categories"
          icon={Folder}
        />
        <Link href="/dashboard/categories/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </Link>
      </div>

      {/* Categories Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage your blog post categories</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first category</p>
              <Link href="/dashboard/categories/new">
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Create Category
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Slug</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Created</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b">
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">{category.slug}</td>
                      <td className="py-3 px-4">
                        {category.description ? (
                          <span className="line-clamp-1">{category.description}</span>
                        ) : (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {formatDistanceToNow(new Date(category.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/categories/${category.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          {user.role === "admin" && (
                            <DeleteCategoryButton 
                              categoryId={category.id} 
                              categoryName={category.name} 
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}