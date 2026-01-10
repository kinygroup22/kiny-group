/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/departments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamMembers, departments } from "@/lib/db/schema";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// GET: Fetch a specific department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (department.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json(department[0]);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a department and all its team members
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    // Check if department exists
    const existing = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Delete all team members in this department first
    await db.delete(teamMembers).where(eq(teamMembers.departmentId, departmentId));

    // Then delete the department
    await db.delete(departments).where(eq(departments.id, departmentId));

    revalidatePath("/dashboard/departments");
    revalidatePath("/dashboard/team-members");
    revalidatePath("/about");

    return NextResponse.json({ 
      success: true, 
      message: "Department and all associated team members deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete department." },
      { status: 500 }
    );
  }
}

// PUT: Update a department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const departmentId = parseInt(id);
    const body = await request.json();

    if (isNaN(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    // Check if department exists
    const existing = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Update department
    const updated = await db
      .update(departments)
      .set({
        name: body.name,
        description: body.description,
        head: body.head,
        color: body.color,
        order: body.order,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, departmentId))
      .returning();

    revalidatePath("/dashboard/departments");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Department updated successfully",
      department: updated[0],
    });
  } catch (error) {
    console.error("Error updating department:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update department." },
      { status: 500 }
    );
  }
}