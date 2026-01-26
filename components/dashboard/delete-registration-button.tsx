// components/dashboard/delete-registration-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteRegistrationButtonProps {
  registrationId: number;
  registrantName: string;
  onDelete?: () => void; // Optional callback for immediate UI updates
}

export function DeleteRegistrationButton({ 
  registrationId, 
  registrantName,
  onDelete 
}: DeleteRegistrationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/dashboard/event-registrations/${registrationId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Registration deleted successfully");
        setIsOpen(false);
        // Call the callback if provided
        if (onDelete) {
          onDelete();
        } else {
          router.refresh();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete registration");
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast.error("Failed to delete registration");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Registration</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the registration for <strong>{registrantName}</strong>? This action cannot be
            undone and will permanently remove this registration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Registration"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}