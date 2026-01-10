// components/dashboard/achievement-management/achievement-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle } from "lucide-react";
import { Achievement } from "@/lib/db/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AchievementFormProps {
  achievement?: Achievement;
}

export function AchievementForm({ achievement }: AchievementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: achievement?.title || "",
    description: achievement?.description || "",
    icon: achievement?.icon || "",
    order: achievement?.order || 0,
    featured: achievement?.featured || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));
    
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: "" }));
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const icon = e.target.value;
    setFormData(prev => ({ ...prev, icon }));
    
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: "" }));
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const order = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, order }));
    
    if (errors.order) {
      setErrors(prev => ({ ...prev, order: "" }));
    }
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, featured: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (isNaN(formData.order) || formData.order < 0) {
      newErrors.order = "Order must be a non-negative number";
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
      const endpoint = achievement ? `/api/achievements/${achievement.id}` : '/api/achievements';
      const method = achievement ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save achievement');
      }

      toast.success(achievement ? "Achievement updated successfully" : "Achievement added successfully");
      router.push("/dashboard/achievements");
      router.refresh();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save achievement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-sm py-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Achievement Information</CardTitle>
          <CardDescription>
            Enter the details for your achievement. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter achievement title"
              className={cn(errors.title && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Enter achievement description"
              className={cn(errors.description && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon Name</Label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleIconChange}
              placeholder="e.g., Award, Trophy, Star"
              className={cn(errors.icon && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Use icon names from lucide-react (e.g., Award, Trophy, Star)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleOrderChange}
              placeholder="0"
              min="0"
              className={cn(errors.order && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            {errors.order && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.order}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the list
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={handleFeaturedChange}
              disabled={isSubmitting}
            />
            <Label htmlFor="featured">Featured Achievement</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Featured achievements will be highlighted on the about page
          </p>
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
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {achievement ? "Updating..." : "Adding..."}
            </>
          ) : (
            achievement ? "Update Achievement" : "Add Achievement"
          )}
        </Button>
      </div>
    </form>
  );
}