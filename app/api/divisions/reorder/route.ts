// app/api/divisions/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { reorderDivisions } from "@/lib/api/divisions";
import { requireEditor } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    await requireEditor();
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array of division IDs" },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    if (!orderedIds.every((id: unknown) => typeof id === "number")) {
      return NextResponse.json(
        { error: "All IDs must be numbers" },
        { status: 400 }
      );
    }

    await reorderDivisions(orderedIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering divisions:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reorder divisions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}