// app/api/(public)/about/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const clientData = await db.select()
      .from(clients)
      .orderBy(asc(clients.order));
    
    // Transform the data to match the expected format in the component
    const transformedClients = clientData.map(client => ({
      name: client.name,
      logo: client.logoUrl
    }));
    
    return NextResponse.json(transformedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}