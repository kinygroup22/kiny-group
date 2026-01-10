// app/api/divisions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDivisions, createDivision } from "@/lib/api/divisions";
import { requireEditor } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");
    
    const divisions = await getDivisions();
    
    // Filter by featured if specified
    let filteredDivisions = divisions;
    if (featured === "true") {
      filteredDivisions = divisions.filter(d => d.featured);
    }
    
    return NextResponse.json(filteredDivisions);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch divisions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireEditor();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.description || !data.fullDescription) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, description, fullDescription" },
        { status: 400 }
      );
    }
    
    // Validate slug format (lowercase, hyphens only)
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }
    
    const division = await createDivision(data);
    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    console.error("Error creating division:", error);
    const message = error instanceof Error ? error.message : "Failed to create division";
    const status = message.includes("unique") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}