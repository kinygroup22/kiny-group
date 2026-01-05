/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/partners/[id]/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
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

    redirect("/dashboard/partners");
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