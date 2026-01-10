// app/api/divisions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDivision, updateDivision, deleteDivision } from "@/lib/api/divisions";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params Promise
    const divisionId = parseInt(id);
    if (isNaN(divisionId)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    const division = await getDivision(divisionId);
    if (!division) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("Error fetching division:", error);
    return NextResponse.json(
      { error: "Failed to fetch division" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await request.json();
    
    // Validate slug format if provided
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }
    
    const division = await updateDivision(divisionId, data);
    
    if (!division) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }
    
    return NextResponse.json(division);
  } catch (error) {
    console.error("Error updating division:", error);
    const message = error instanceof Error ? error.message : "Failed to update division";
    
    // Handle specific error types
    if (message.includes("Permission denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("unique")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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

    await deleteDivision(divisionId);
    return NextResponse.json({ success: true, message: "Division deleted successfully" });
  } catch (error) {
    console.error("Error deleting division:", error);
    const message = error instanceof Error ? error.message : "Failed to delete division";
    
    // Handle specific error types
    if (message.includes("Permission denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}