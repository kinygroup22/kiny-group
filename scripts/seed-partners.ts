// scripts/seed-partners.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { partners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedPartners() {
  console.log("Seeding partners data...");

  try {
    // Seed Partners
    console.log("Seeding partners...");
    const partnersData = [
      {
        name: "UNESCO",
        logoUrl: "https://picsum.photos/seed/unesco/200/100.jpg",
        order: 0,
      },
      {
        name: "World Bank",
        logoUrl: "https://picsum.photos/seed/worldbank/200/100.jpg",
        order: 1,
      },
      {
        name: "UNICEF",
        logoUrl: "https://picsum.photos/seed/unicef/200/100.jpg",
        order: 2,
      },
      {
        name: "Microsoft Education",
        logoUrl: "https://picsum.photos/seed/microsoft/200/100.jpg",
        order: 3,
      },
      {
        name: "Google for Education",
        logoUrl: "https://picsum.photos/seed/google/200/100.jpg",
        order: 4,
      },
      {
        name: "Cambridge Assessment",
        logoUrl: "https://picsum.photos/seed/cambridge/200/100.jpg",
        order: 5,
      },
      {
        name: "Pearson Education",
        logoUrl: "https://picsum.photos/seed/pearson/200/100.jpg",
        order: 6,
      },
      {
        name: "British Council",
        logoUrl: "https://picsum.photos/seed/british/200/100.jpg",
        order: 7,
      }
    ];

    // Insert partners
    for (const partnerData of partnersData) {
      // Check if partner already exists
      const existingPartner = await db.select().from(partners).where(eq(partners.name, partnerData.name));
      
      if (existingPartner.length === 0) {
        await db.insert(partners).values(partnerData);
      }
    }

    console.log("Partners data seeded successfully!");
  } catch (error) {
    console.error("Error seeding partners data:", error);
  }
}

seedPartners();