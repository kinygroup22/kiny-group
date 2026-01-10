/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET: Fetch all departments
export async function GET() {
  try {
    const allDepartments = await db
      .select()
      .from(departments)
      .orderBy(departments.order);
    
    return NextResponse.json(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// POST: Create a new department
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newDepartment = await db
      .insert(departments)
      .values({
        name: body.name,
        head: body.head || "",
        description: body.description || "",
        color: body.color || "",
        order: body.order || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/departments");
    revalidatePath("/about");

    return NextResponse.json({
      message: "Department created successfully",
      department: newDepartment[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create department." },
      { status: 500 }
    );
  }
}