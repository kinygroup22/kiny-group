/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { BlogCategory } from "@/lib/db/schema";
// REMOVED: import { createCategory, updateCategory } from "@/lib/api/categories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  category?: BlogCategory;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') 
      .replace(/\s+/g, '-') 
      .replace(/-+/g, '-') 
      .replace(/^-+|-+$/g, ''); 
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === category?.slug) {
      setSlugAvailable(null);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const response = await fetch(`/api/categories/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      setSlugAvailable(data.available);
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const newSlug = formData.slug || generateSlug(name);
    
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || newSlug
    }));

    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    setFormData(prev => ({ ...prev, slug }));
    
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: "" }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = category ? `/api/categories/${category.id}` : '/api/categories';
      const method = category ? 'PUT' : 'POST';

      // CHANGED: Using fetch like PostForm instead of direct function import
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      toast.success(category ? "Category updated successfully" : "Category created successfully");
      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.slug && formData.slug !== category?.slug) {
        checkSlugAvailability(formData.slug);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.slug, category?.slug]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-sm py-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Category Information</CardTitle>
          <CardDescription>
            Enter the details for your blog post category. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              className={cn(errors.name && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-1">
              Slug <span className="text-destructive">*</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }))}
                disabled={!formData.name || isSubmitting}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate
              </Button>
            </Label>
            <div className="relative">
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="category-url-slug"
                className={cn(
                  errors.slug && "border-destructive focus:ring-destructive",
                  slugAvailable === false && "border-destructive focus:ring-destructive",
                  slugAvailable === true && "border-green-500 focus:ring-green-500"
                )}
                disabled={isSubmitting}
              />
              {isCheckingSlug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {slugAvailable === true && !isCheckingSlug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {slugAvailable === false && !isCheckingSlug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              )}
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.slug}
              </p>
            )}
            {slugAvailable === false && !errors.slug && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This slug is already taken
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be part of the URL: /blog/category/{formData.slug || "your-slug"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Brief description of the category"
              rows={4}
              className={cn(errors.description && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {formData.name && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  {formData.name}
                </Badge>
                {formData.description && (
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL: /blog/category/{formData.slug}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || slugAvailable === false}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? "Updating..." : "Creating..."}
            </>
          ) : (
            category ? "Update Category" : "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
}