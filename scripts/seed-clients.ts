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
    console.log("Clearing existing clients data...");
    await db.delete(clients);
    console.log("✅ Cleared existing clients");

    const clientsData = [
      // === Row 1: Government ===
      {
        name: "Wakil Presiden Republik Indonesia",
        logoUrl: "/clients/wakil-presiden-ri.png",
        order: 0,
      },
      {
        name: "TNI / Polri",
        logoUrl: "/clients/tni-polri.png",
        order: 1,
      },
      {
        name: "Kementerian Pendidikan dan Kebudayaan",
        logoUrl: "/clients/kemendikbud.png",
        order: 2,
      },
      {
        name: "Kementerian Koperasi dan UKM",
        logoUrl: "/clients/kementerian-koperasi-ukm.png",
        order: 3,
      },
      {
        name: "Kementerian Perdagangan Republik Indonesia",
        logoUrl: "/clients/kemendag.png",
        order: 4,
      },

      // === Row 2: State-Owned Enterprises ===
      {
        name: "BUMN - Kementerian BUMN",
        logoUrl: "/clients/bumn.png",
        order: 5,
      },
      {
        name: "Pemerintah Daerah",
        logoUrl: "/clients/pemda.png",
        order: 6,
      },
      {
        name: "Lembaga Pemerintah",
        logoUrl: "/clients/lembaga-pemerintah.png",
        order: 7,
      },
      {
        name: "Pertamina",
        logoUrl: "/clients/pertamina.png",
        order: 8,
      },

      // === Row 3: Banks / Financial ===
      {
        name: "Bank Rakyat Indonesia (BRI)",
        logoUrl: "/clients/bri.png",
        order: 9,
      },
      {
        name: "Citibank",
        logoUrl: "/clients/citibank.png",
        order: 10,
      },
      {
        name: "Tugure Insurance",
        logoUrl: "/clients/tugure.png",
        order: 11,
      },
      {
        name: "Bank Negara Indonesia (BNI)",
        logoUrl: "/clients/bni.png",
        order: 12,
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