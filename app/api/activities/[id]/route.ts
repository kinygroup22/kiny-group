/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/activities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getActivity, updateActivity, deleteActivity } from "@/lib/api/activities";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const activityId = parseInt(id);
    if (isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const data = await request.json();
    const activity = await updateActivity(activityId, data);
    
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error updating activity:", error);
    const message = error instanceof Error ? error.message : "Failed to update activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const activityId = parseInt(id);
    if (isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    await deleteActivity(activityId);
    return NextResponse.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    const message = error instanceof Error ? error.message : "Failed to delete activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}