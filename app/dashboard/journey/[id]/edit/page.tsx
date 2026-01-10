/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/journey/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { journeyItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JourneyForm } from "@/components/dashboard/journey-management/journey-form";

export default async function EditJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const itemId = parseInt(id);

  // Fetch the journey item
  const itemData = await db
    .select()
    .from(journeyItems)
    .where(eq(journeyItems.id, itemId))
    .limit(1);

  if (itemData.length === 0) {
    notFound();
  }

  const item = itemData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Journey Item</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{item.title}&quot;
        </p>
      </div>

      <JourneyForm item={item} />
    </div>
  );
}