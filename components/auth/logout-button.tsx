// components/auth/logout-button.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="border-navy-200 dark:border-navy-700"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}