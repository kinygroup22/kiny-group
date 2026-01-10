// components/ui/file-upload.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label: string;
  className?: string;
}

export function FileUpload({ value, onChange, folder = "divisions", label, className }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        // Create a mock progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.url);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={value}
                alt={label}
                className="w-full h-48 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag & drop an image here, or click to select"}
                </p>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, GIF up to 10MB
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
      <input {...getInputProps()} />
    </div>
  );
}