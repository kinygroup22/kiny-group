/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/clients/new/page.tsx
import { requireEditor } from "@/lib/auth";
import { ClientForm } from "@/components/dashboard/client-management/client-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Info } from "lucide-react";

export default async function NewClientPage() {
  // 1. Keep security check here (Server Component)
  const user = await requireEditor();

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground">Add a new client logo to display on your about page</p>
      </div>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 py-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Lightbulb className="h-5 w-5" />
            Tips for Adding Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Use high-quality logos with transparent backgrounds when possible</p>
              <p>• Set the order to control how clients appear on the about page</p>
              <p>• Make sure you have the right to use the client&apos;s logo</p>
              <p>• Consider using Cloudinary for optimized image delivery</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <ClientForm />
    </div>
  );
}