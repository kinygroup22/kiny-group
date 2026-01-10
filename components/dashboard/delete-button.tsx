/* eslint-disable @typescript-eslint/no-unused-vars */
// components/dashboard/delete-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: number;
  resourceType: string;
  resourceName: string;
  confirmMessage?: string;
}

export function DeleteButton({ id, resourceType, resourceName, confirmMessage }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const message = confirmMessage || `Are you sure you want to delete this ${resourceType}?`;
    if (!confirm(message)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/${resourceType}s/${id}/delete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${resourceType}`);
      }

      router.push(`/dashboard/${resourceType}s`);
      router.refresh();
    } catch (error) {
      console.error(`Error deleting ${resourceType}:`, error);
      alert(error instanceof Error ? error.message : `Failed to delete ${resourceType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1 text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Delete
        </>
      )}
    </Button>
  );
}