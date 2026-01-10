// app/api/(public)/about/team-members/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamMembers, departments } from "@/lib/db/schema";
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