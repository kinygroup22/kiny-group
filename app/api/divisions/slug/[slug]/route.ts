// app/api/divisions/slug/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDivisionBySlug } from "@/lib/api/divisions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params; // Await the params Promise
    const division = await getDivisionBySlug(slug);
    
    if (!division) {
      return NextResponse.json({ error: "Division not found" }, { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("Error fetching division by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch division" },
      { status: 500 }
    );
  }
}
