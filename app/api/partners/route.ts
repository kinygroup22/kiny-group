/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/partners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET: Fetch a single partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const partnerId = parseInt(id);
    
    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 });
    }

    const partner = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (partner.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner[0]);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500 }
    );
  }
}

// PUT: Update a partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const user = await requireEditor();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const partnerId = parseInt(id);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if partner exists
    const existing = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

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

    const updatedPartner = await db
      .update(partners)
      .set({
        name: body.name,
        logoUrl: body.logoUrl,
        order: body.order || 0,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();

    revalidatePath("/dashboard/partners");
    revalidatePath("/");

    return NextResponse.json({
      message: "Partner updated successfully",
      partner: updatedPartner[0],
    });
  } catch (error) {
    console.error("Error updating partner:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update partner." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const user = await requireAdmin();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const partnerId = parseInt(id);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 });
    }

    // Check if partner exists
    const existing = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    await db.delete(partners).where(eq(partners.id, partnerId));

    revalidatePath("/dashboard/partners");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete partner." },
      { status: 500 }
    );
  }
}