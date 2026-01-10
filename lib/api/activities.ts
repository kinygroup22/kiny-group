// lib/api/activities.ts
import { db } from "@/lib/db";
import { brandActivities, brandDivisions } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm"; // Added 'asc' import
import { getCurrentUser } from "@/lib/auth";

export async function getActivities(brandDivisionId: number) {
  if (!brandDivisionId || brandDivisionId <= 0) {
    throw new Error("Valid Division ID is required");
  }
  
  return await db
    .select()
    .from(brandActivities)
    .where(eq(brandActivities.brandDivisionId, brandDivisionId))
    .orderBy(asc(brandActivities.order)); // Fixed: use asc() function
}

export async function getActivity(id: number) {
  if (!id || id <= 0) {
    throw new Error("Valid Activity ID is required");
  }
  
  const [activity] = await db
    .select()
    .from(brandActivities)
    .where(eq(brandActivities.id, id))
    .limit(1);
  return activity || null;
}

export async function createActivity(brandDivisionId: number, data: {
  title: string;
  description: string;
  imageUrl: string;
  order?: number;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!brandDivisionId || brandDivisionId <= 0) {
    throw new Error("Valid Division ID is required");
  }

  // Check if user has permission to add activities to this division
  const division = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, brandDivisionId))
    .limit(1);

  if (!division.length) {
    throw new Error("Division not found");
  }

  // Editors can only edit their own divisions
  if (
    user.role === "editor" && 
    division[0].authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  // Get the current highest order value
  const currentActivities = await getActivities(brandDivisionId);
  const nextOrder = data.order !== undefined ? data.order : (currentActivities.length > 0 ? Math.max(...currentActivities.map(a => a.order)) + 1 : 0);

  const [newActivity] = await db
    .insert(brandActivities)
    .values({
      brandDivisionId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      order: nextOrder,
    })
    .returning();

  return newActivity;
}

export async function updateActivity(
  id: number,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
  }
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!id) {
    throw new Error("Activity ID is required");
  }

  // Check if activity exists and user has permission
  const activity = await getActivity(id);
  if (!activity) {
    throw new Error("Activity not found");
  }

  const division = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, activity.brandDivisionId))
    .limit(1);

  if (!division.length) {
    throw new Error("Division not found");
  }

  // Editors can only edit their own divisions
  if (
    user.role === "editor" && 
    division[0].authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  const [updatedActivity] = await db
    .update(brandActivities)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(brandActivities.id, id))
    .returning();

  return updatedActivity;
}

export async function deleteActivity(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!id) {
    throw new Error("Activity ID is required");
  }

  // Check if activity exists and user has permission
  const activity = await getActivity(id);
  if (!activity) {
    throw new Error("Activity not found");
  }

  const division = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, activity.brandDivisionId))
    .limit(1);

  if (!division.length) {
    throw new Error("Division not found");
  }

  // Editors can only edit their own divisions
  if (
    user.role === "editor" && 
    division[0].authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  await db.delete(brandActivities).where(eq(brandActivities.id, id));
  return { success: true };
}

export async function reorderActivities(brandDivisionId: number, activityIds: number[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!brandDivisionId) {
    throw new Error("Division ID is required");
  }

  // Check if user has permission to reorder activities in this division
  const division = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, brandDivisionId))
    .limit(1);

  if (!division.length) {
    throw new Error("Division not found");
  }

  // Editors can only edit their own divisions
  if (
    user.role === "editor" && 
    division[0].authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  // Update the order of each activity
  const updates = activityIds.map((id, index) =>
    db
      .update(brandActivities)
      .set({ order: index, updatedAt: new Date() })
      .where(and(eq(brandActivities.id, id), eq(brandActivities.brandDivisionId, brandDivisionId)))
  );

  await Promise.all(updates);
  return { success: true };
}