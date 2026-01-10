/* eslint-disable @typescript-eslint/no-unused-vars */
// components/dashboard/client-management/client-form.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Upload, X } from "lucide-react";
import { Client } from "@/lib/db/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || "",
    logoUrl: client?.logoUrl || "",
    order: client?.order || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logoUrl = e.target.value;
    setFormData(prev => ({ ...prev, logoUrl }));
    
    if (errors.logoUrl) {
      setErrors(prev => ({ ...prev, logoUrl: "" }));
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
      formData.append('folder', 'clients'); // Upload to clients folder

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      setErrors(prev => ({ ...prev, logoUrl: "" }));
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
    setFormData(prev => ({ ...prev, logoUrl: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (!formData.logoUrl.trim()) {
      newErrors.logoUrl = "Logo URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
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
      const endpoint = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      toast.success(client ? "Client updated successfully" : "Client added successfully");
      router.push("/dashboard/clients");
      router.refresh();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save client");
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
          <CardTitle className="text-xl">Client Information</CardTitle>
          <CardDescription>
            Enter the details for your client. Required fields are marked with an asterisk (*).
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
              placeholder="Enter client name"
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
            <Label className="flex items-center gap-2">
              Logo <span className="text-destructive">*</span>
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

            {formData.logoUrl && (
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
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border rounded bg-white">
                    <Image
                      src={formData.logoUrl}
                      alt={formData.name || "Client logo"}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{formData.name || "Client Name"}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {formData.logoUrl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleLogoUrlChange}
              placeholder="Or paste image URL: https://example.com/logo.png"
              className={cn(errors.logoUrl && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting || isUploading}
            />
            {errors.logoUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.logoUrl}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload an image or paste an image URL. Max file size: 10MB. Supported formats: JPEG, PNG, GIF, WebP
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
              {client ? "Updating..." : "Adding..."}
            </>
          ) : (
            client ? "Update Client" : "Add Client"
          )}
        </Button>
      </div>
    </form>
  );
}