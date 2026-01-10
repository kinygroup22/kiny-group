// app/api/divisions/[id]/toggle-featured/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDivision, updateDivision } from "@/lib/api/divisions";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params; // Await the params Promise
    const divisionId = parseInt(id);
    if (isNaN(divisionId)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    const division = await getDivision(divisionId);
    if (!division) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }

    const updatedDivision = await updateDivision(divisionId, {
      featured: !division.featured
    });

    return NextResponse.json(updatedDivision);
  } catch (error) {
    console.error("Error toggling featured status:", error);
    const message = error instanceof Error ? error.message : "Failed to update division";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}