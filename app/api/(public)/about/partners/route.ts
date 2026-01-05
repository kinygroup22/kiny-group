// app/api/(public)/about/partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const partnerData = await db.select()
      .from(partners)
      .orderBy(asc(partners.order));
    
    // Transform the data to match the expected format in the component
    const transformedPartners = partnerData.map(partner => ({
      name: partner.name,
      logo: partner.logoUrl
    }));
    
    return NextResponse.json(transformedPartners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}