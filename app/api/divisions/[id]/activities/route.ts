// app/api/divisions/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getActivities, createActivity, reorderActivities } from "@/lib/api/activities";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const divisionId = parseInt(id);
    if (isNaN(divisionId)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    const activities = await getActivities(divisionId);
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const divisionId = parseInt(id);
    if (isNaN(divisionId)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.description || !data.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, imageUrl" },
        { status: 400 }
      );
    }
    
    const activity = await createActivity(divisionId, data);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    const message = error instanceof Error ? error.message : "Failed to create activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const divisionId = parseInt(id);
    if (isNaN(divisionId)) {
      return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
    }

    const { activityIds } = await request.json();

    if (!Array.isArray(activityIds)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    await reorderActivities(divisionId, activityIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering activities:", error);
    const message = error instanceof Error ? error.message : "Failed to reorder activities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}