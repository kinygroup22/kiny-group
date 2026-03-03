// scripts/seed-clients.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { clients } from "@/lib/db/schema";

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedClients() {
  console.log("Seeding clients data...");

  try {
    // Clear existing clients data
    console.log("Clearing existing clients data...");
    await db.delete(clients);
    console.log("✅ Cleared existing clients");

    const clientsData = [
      {
        name: "Harvard University",
        logoUrl: "https://picsum.photos/seed/harvard/200/100.jpg",
        order: 0,
      },
      {
        name: "Stanford University",
        logoUrl: "https://picsum.photos/seed/stanford/200/100.jpg",
        order: 1,
      },
      {
        name: "MIT",
        logoUrl: "https://picsum.photos/seed/mit/200/100.jpg",
        order: 2,
      },
      {
        name: "Oxford University",
        logoUrl: "https://picsum.photos/seed/oxford/200/100.jpg",
        order: 3,
      },
      {
        name: "Cambridge University",
        logoUrl: "https://picsum.photos/seed/cambridge/200/100.jpg",
        order: 4,
      },
      {
        name: "Yale University",
        logoUrl: "https://picsum.photos/seed/yale/200/100.jpg",
        order: 5,
      },
      {
        name: "Princeton University",
        logoUrl: "https://picsum.photos/seed/princeton/200/100.jpg",
        order: 6,
      },
      {
        name: "Columbia University",
        logoUrl: "https://picsum.photos/seed/columbia/200/100.jpg",
        order: 7,
      },
    ];

    for (const client of clientsData) {
      await db.insert(clients).values(client);
      console.log(`✅ Created client: ${client.name}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Clients data seeded successfully!");
    console.log("=".repeat(50));
    console.log(`\n📋 ${clientsData.length} clients created`);

  } catch (error) {
    console.error("\n❌ Error seeding clients data:", error);
    throw error;
  }
}

seedClients()
  .then(() => {
    console.log("\n✅ Clients seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Clients seed script failed:", error);
    process.exit(1);
  });