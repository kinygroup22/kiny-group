/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/team-members/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamMembers, departments } from "@/lib/db/schema";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET: Fetch a single team member with department info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamMemberId = parseInt(id);
    
    if (isNaN(teamMemberId)) {
      return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
    }

    const teamMember = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        title: teamMembers.title,
        bio: teamMembers.bio,
        image: teamMembers.image,
        role: teamMembers.role,
        departmentId: teamMembers.departmentId,
        departmentName: departments.name,
        order: teamMembers.order,
        icon: teamMembers.icon,
        achievements: teamMembers.achievements,
        createdAt: teamMembers.createdAt,
        updatedAt: teamMembers.updatedAt,
      })
      .from(teamMembers)
      .leftJoin(departments, eq(teamMembers.departmentId, departments.id))
      .where(eq(teamMembers.id, teamMemberId))
      .limit(1);

    if (teamMember.length === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json(teamMember[0]);
  } catch (error) {
    console.error("Error fetching team member:", error);
    return NextResponse.json(
      { error: "Failed to fetch team member" },
      { status: 500 }
    );
  }
}

// PUT: Update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const teamMemberId = parseInt(id);

    if (isNaN(teamMemberId)) {
      return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if team member exists
    const existing = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, teamMemberId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.name || !body.title || !body.departmentId) {
      return NextResponse.json(
        { error: "Name, title, and department ID are required" },
        { status: 400 }
      );
    }

    // Validate department exists
    const departmentExists = await db
      .select()
      .from(departments)
      .where(eq(departments.id, body.departmentId))
      .limit(1);

    if (departmentExists.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 400 }
      );
    }

    const updatedTeamMember = await db
      .update(teamMembers)
      .set({
        name: body.name,
        title: body.title,
        bio: body.bio || "",
        image: body.image || "",
        role: body.role || "team_member",
        departmentId: body.departmentId,
        order: body.order || 0,
        icon: body.icon || "",
        achievements: body.achievements || [],
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, teamMemberId))
      .returning();

    revalidatePath("/dashboard/team-members");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Team member updated successfully",
      teamMember: updatedTeamMember[0],
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update team member." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const teamMemberId = parseInt(id);

    if (isNaN(teamMemberId)) {
      return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
    }

    // Check if team member exists
    const existing = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, teamMemberId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, teamMemberId));

    revalidatePath("/dashboard/team-members");
    revalidatePath("/about");

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team member:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete team member." },
      { status: 500 }
    );
  }
}