/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/partners/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PartnerForm } from "@/components/dashboard/partner-management/partner-form";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const partnerId = parseInt(id);

  // Fetch the partner
  const partnerData = await db
    .select()
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1);

  if (partnerData.length === 0) {
    notFound();
  }

  const partner = partnerData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Partner</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{partner.name}&quot;
        </p>
      </div>

      <PartnerForm partner={partner} />
    </div>
  );
}