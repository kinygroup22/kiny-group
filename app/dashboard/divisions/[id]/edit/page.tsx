// app/dashboard/divisions/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, requireEditor } from "@/lib/auth";
import { VisualDivisionForm } from "@/components/dashboard/visual-division-form";
import { db } from "@/lib/db";
import { brandDivisions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Make the component async and properly type the params
export default async function EditDivisionPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params if using Next.js 13.4+ with App Router
  const resolvedParams = await params;
  const user = await requireEditor();
  
  // Check if id exists before parsing
  if (!resolvedParams.id) {
    redirect("/dashboard/divisions");
  }
  
  const divisionId = parseInt(resolvedParams.id);

  if (isNaN(divisionId)) {
    redirect("/dashboard/divisions");
  }

  // Fetch the division
  const [division] = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, divisionId));

  if (!division) {
    notFound();
  }

  // Check if user has permission to edit this division
  if (
    user.role === "editor" && 
    division.authorId !== user.id
  ) {
    redirect("/dashboard/divisions");
  }

  return (
    <div className="w-full">
      <VisualDivisionForm user={user} division={division} />
    </div>
  );
}