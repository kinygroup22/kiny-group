/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/journey/new/page.tsx
import { requireEditor } from "@/lib/auth";
import { JourneyForm } from "@/components/dashboard/journey-management/journey-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Info } from "lucide-react";

export default async function NewJourneyPage() {
  // 1. Keep security check here (Server Component)
  const user = await requireEditor();

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Journey Item</h1>
        <p className="text-muted-foreground">Add a new milestone to your company&apos;s journey</p>
      </div>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 py-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Lightbulb className="h-5 w-5" />
            Tips for Adding Journey Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Use high-quality images that represent the milestone</p>
              <p>• Keep descriptions concise but informative</p>
              <p>• Set the order to control how items appear in the timeline</p>
              <p>• Consider using Cloudinary for optimized image delivery</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <JourneyForm />
    </div>
  );
}