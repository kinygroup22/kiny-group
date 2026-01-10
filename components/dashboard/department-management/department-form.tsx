// components/dashboard/department-management/department-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Department } from "@/lib/db/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DepartmentFormProps {
  department?: Department;
}

export function DepartmentForm({ department }: DepartmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: department?.name || "",
    head: department?.head || "",
    description: department?.description || "",
    color: department?.color || "",
    order: department?.order || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleHeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const head = e.target.value;
    setFormData(prev => ({ ...prev, head }));
    
    if (errors.head) {
      setErrors(prev => ({ ...prev, head: "" }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: "" }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFormData(prev => ({ ...prev, color }));
    
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: "" }));
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const order = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, order }));
    
    if (errors.order) {
      setErrors(prev => ({ ...prev, order: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
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
      const endpoint = department ? `/api/departments/${department.id}` : '/api/departments';
      const method = department ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save department');
      }

      toast.success(department ? "Department updated successfully" : "Department added successfully");
      router.push("/dashboard/departments");
      router.refresh();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-sm py-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Department Information</CardTitle>
          <CardDescription>
            Enter the details for your department. Required fields are marked with an asterisk (*).
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
              placeholder="Enter department name"
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
            <Label htmlFor="head">Department Head</Label>
            <Input
              id="head"
              name="head"
              value={formData.head}
              onChange={handleHeadChange}
              placeholder="Enter department head name"
              className={cn(errors.head && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            {errors.head && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.head}
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
              placeholder="Enter department description"
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
            <Label htmlFor="color">Department Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleColorChange}
                placeholder="#000000"
                className={cn(errors.color && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              <div 
                className="w-10 h-10 rounded-md border"
                style={{ backgroundColor: formData.color || "#000000" }}
              />
            </div>
            {errors.color && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.color}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a hex color code (e.g., #3B82F6)
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
              {department ? "Updating..." : "Adding..."}
            </>
          ) : (
            department ? "Update Department" : "Add Department"
          )}
        </Button>
      </div>
    </form>
  );
}