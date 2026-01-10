// components/auth/sign-out-button.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showConfirmation?: boolean;
  callbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  showConfirmation = true,
  callbackUrl = "/login",
  className,
  children,
}: SignOutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  };

  const onClickHandler = () => {
    if (showConfirmation) {
      setIsOpen(true);
    } else {
      handleSignOut();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={onClickHandler}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            {showIcon && <LogOut className="mr-2 h-4 w-4" />}
            {children || "Sign Out"}
          </>
        )}
      </Button>

      {showConfirmation && (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                disabled={isLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}