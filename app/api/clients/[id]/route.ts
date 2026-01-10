/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET: Fetch a single client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id);
    
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (client.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client[0]);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT: Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if client exists
    const existing = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
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

    const updatedClient = await db
      .update(clients)
      .set({
        name: body.name,
        logoUrl: body.logoUrl,
        order: body.order || 0,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    revalidatePath("/dashboard/clients");
    revalidatePath("/");

    return NextResponse.json({
      message: "Client updated successfully",
      client: updatedClient[0],
    });
  } catch (error) {
    console.error("Error updating client:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update client." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEditor();
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Check if client exists
    const existing = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await db.delete(clients).where(eq(clients.id, clientId));

    revalidatePath("/dashboard/clients");
    revalidatePath("/");

    return NextResponse.json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete client." },
      { status: 500 }
    );
  }
}