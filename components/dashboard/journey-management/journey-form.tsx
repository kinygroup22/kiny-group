 // components/dashboard/journey-management/journey-form.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Upload, X } from "lucide-react";
import { JourneyItem } from "@/lib/db/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface JourneyFormProps {
  item?: JourneyItem;
}

export function JourneyForm({ item }: JourneyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    year: item?.year || "",
    title: item?.title || "",
    description: item?.description || "",
    imageUrl: item?.imageUrl || "",
    order: item?.order || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setFormData(prev => ({ ...prev, year }));
    
    if (errors.year) {
      setErrors(prev => ({ ...prev, year: "" }));
    }
  };

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

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl }));
    
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const order = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, order }));
    
    if (errors.order) {
      setErrors(prev => ({ ...prev, order: "" }));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'journey'); // Upload to journey folder

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setErrors(prev => ({ ...prev, imageUrl: "" }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.year.trim()) {
      newErrors.year = "Year is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid URL";
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
      const endpoint = item ? `/api/journey/${item.id}` : '/api/journey';
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save journey item');
      }

      toast.success(item ? "Journey item updated successfully" : "Journey item added successfully");
      router.push("/dashboard/journey");
      router.refresh();
    } catch (error) {
      console.error("Error saving journey item:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save journey item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Card className="shadow-sm py-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Journey Item Information</CardTitle>
          <CardDescription>
            Enter the details for your journey item. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center gap-1">
                Year <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleYearChange}
                placeholder="2023"
                className={cn(errors.year && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              {errors.year && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.year}
                </p>
              )}
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
                Lower numbers appear first in the timeline
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter journey item title"
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
            <Label htmlFor="description" className="flex items-center gap-1">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Enter journey item description"
              rows={4}
              className={cn(errors.description && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Image <span className="text-destructive">*</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs ml-auto"
                onClick={handleImageUpload}
                disabled={isSubmitting || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Image
                  </>
                )}
              </Button>
            </Label>

            {formData.imageUrl && (
              <div className="relative p-4 bg-muted/50 rounded-lg border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-48 h-48 border rounded bg-white">
                    <Image
                      src={formData.imageUrl}
                      alt={formData.title || "Journey item image"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Badge variant="secondary" className="text-sm">
                      {formData.year || "Year"}
                    </Badge>
                    <h3 className="font-semibold">{formData.title || "Title"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description || "Description"}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {formData.imageUrl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              placeholder="Or paste image URL: https://example.com/image.jpg"
              className={cn(errors.imageUrl && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting || isUploading}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.imageUrl}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload an image or paste an image URL. Max file size: 10MB. Supported formats: JPEG, PNG, GIF, WebP
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {item ? "Updating..." : "Adding..."}
            </>
          ) : (
            item ? "Update Journey Item" : "Add Journey Item"
          )}
        </Button>
      </div>
    </form>
  );
}