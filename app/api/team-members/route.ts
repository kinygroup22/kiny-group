/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamMembers, departments } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// GET: Fetch all team members with department info
export async function GET() {
  try {
    const allTeamMembers = await db
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
      .orderBy(teamMembers.order);
    
    return NextResponse.json(allTeamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST: Create a new team member
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

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

    const newTeamMember = await db
      .insert(teamMembers)
      .values({
        name: body.name,
        title: body.title,
        bio: body.bio || "",
        image: body.image || "",
        role: body.role || "team_member",
        departmentId: body.departmentId,
        order: body.order || 0,
        icon: body.icon || "",
        achievements: body.achievements || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/team-members");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Team member created successfully",
      teamMember: newTeamMember[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create team member." },
      { status: 500 }
    );
  }
}