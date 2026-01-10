// app/dashboard/categories/new/page.tsx
import { requireEditor } from "@/lib/auth";
import { CategoryForm } from "@/components/dashboard/category-form"; // <-- CORRECTED IMPORT PATH
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Info } from "lucide-react";

export default async function NewCategoryPage() {
  // 1. Keep security check here (Server Component)
  const user = await requireEditor();

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
        <p className="text-muted-foreground">Add a new blog post category to organize your content</p>
      </div>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 pt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Lightbulb className="h-5 w-5" />
            Tips for Creating Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Use descriptive names that clearly indicate the content type</p>
              <p>• Keep slugs short, memorable, and SEO-friendly</p>
              <p>• Write a brief description to help users understand the category purpose</p>
              <p>• Consider your content strategy when creating categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Examples */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Popular Category Examples</CardTitle>
          <CardDescription>
            Get inspiration from these common blog categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Technology",
              "Design",
              "Business",
              "Marketing",
              "Tutorial",
              "News",
              "Opinion",
              "Case Study",
              "Resources",
              "Updates"
            ].map((category) => (
              <Badge key={category} variant="outline" className="cursor-pointer hover:bg-muted">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {/* 2. Removed user={user} because the form no longer requires it */}
      <CategoryForm />
    </div>
  );
}