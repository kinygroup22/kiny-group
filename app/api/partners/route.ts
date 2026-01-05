/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET: Fetch all partners
export async function GET() {
  try {
    const allPartners = await db
      .select()
      .from(partners)
      .orderBy(partners.order);
    
    return NextResponse.json(allPartners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// POST: Create a new partner
export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.logoUrl) {
      return NextResponse.json(
        { error: "Name and logo URL are required" },
        { status: 400 }
      );
    }

    // Validate logoUrl format
    if (!/^https?:\/\/.+\..+/.test(body.logoUrl)) {
      return NextResponse.json(
        { error: "Invalid logo URL format" },
        { status: 400 }
      );
    }

    const newPartner = await db
      .insert(partners)
      .values({
        name: body.name,
        logoUrl: body.logoUrl,
        order: body.order || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/partners");
    revalidatePath("/");

    return NextResponse.json({
      message: "Partner created successfully",
      partner: newPartner[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating partner:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create partner." },
      { status: 500 }
    );
  }
}