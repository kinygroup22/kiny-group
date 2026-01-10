// app/api/(public)/about/departments/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departments, teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch all departments with team members
export async function GET() {
  try {
    // First, fetch all departments
    const allDepartments = await db
      .select()
      .from(departments)
      .orderBy(departments.order);
    
    // Then, fetch all team members
    const allTeamMembers = await db
      .select()
      .from(teamMembers)
      .orderBy(teamMembers.order);
    
    // Group team members by department
    const departmentsWithTeam = allDepartments.map(dept => ({
      ...dept,
      team: allTeamMembers
        .filter(member => member.departmentId === dept.id)
        .map(member => ({
          id: member.id,
          name: member.name,
          title: member.title,
          image: member.image,
          role: member.role,
          bio: member.bio,
          icon: member.icon,
          achievements: member.achievements,
          order: member.order
        }))
    }));
    
    return NextResponse.json(departmentsWithTeam);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}