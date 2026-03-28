// scripts/seed-partners.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { partners } from "@/lib/db/schema";

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedPartners() {
  console.log("Seeding partners data...");

  try {
    console.log("Clearing existing partners data...");
    await db.delete(partners);
    console.log("✅ Cleared existing partners");

    const partnersData = [
      // === Row 4: Educational Institutions (Top) ===
      {
        name: "Universitas Indonesia",
        logoUrl: "/partners/universitas-indonesia.png",
        order: 0,
      },
      {
        name: "Universitas Padjadjaran",
        logoUrl: "/partners/universitas-padjadjaran.png",
        order: 1,
      },
      {
        name: "Universitas Negeri Jakarta",
        logoUrl: "/partners/universitas-negeri-jakarta.png",
        order: 2,
      },
      {
        name: "Universitas Teknologi Surabaya",
        logoUrl: "/partners/universitas-teknologi-surabaya.png",
        order: 3,
      },
      {
        name: "SMA Negeri Jakarta",
        logoUrl: "/partners/sma-negeri-jakarta.png",
        order: 4,
      },
      {
        name: "Sekolah Menengah",
        logoUrl: "/partners/sekolah-menengah.png",
        order: 5,
      },
      {
        name: "Global Jaya School",
        logoUrl: "/partners/global-jaya-school.png",
        order: 6,
      },

      // === Row 4: Educational Institutions (Bottom) ===
      {
        name: "ITENAS - Institut Teknologi Nasional",
        logoUrl: "/partners/itenas.png",
        order: 7,
      },
      {
        name: "Pesantren Islam",
        logoUrl: "/partners/pesantren-islam.png",
        order: 8,
      },
      {
        name: "Yayasan Pesantren Islam Al Azhar",
        logoUrl: "/partners/yayasan-pesantren-al-azhar.png",
        order: 9,
      },
      {
        name: "Al Azhar",
        logoUrl: "/partners/al-azhar.png",
        order: 10,
      },
      {
        name: "Labschool",
        logoUrl: "/partners/labschool.png",
        order: 11,
      },
      {
        name: "Lembaga Pendidikan",
        logoUrl: "/partners/lembaga-pendidikan.png",
        order: 12,
      },
      {
        name: "Sekolah Islam",
        logoUrl: "/partners/sekolah-islam.png",
        order: 13,
      },
      {
        name: "Al-Azhar Pondok Labu",
        logoUrl: "/partners/al-azhar-pondok-labu.png",
        order: 14,
      },

      // === Row 5: More Schools ===
      {
        name: "Sekolah Crest",
        logoUrl: "/partners/sekolah-crest.png",
        order: 15,
      },
      {
        name: "MIS Jakarta",
        logoUrl: "/partners/mis-jakarta.png",
        order: 16,
      },
      {
        name: "Sekolah Pembangunan Jaya",
        logoUrl: "/partners/sekolah-pembangunan-jaya.png",
        order: 17,
      },
      {
        name: "Dinas Pendidikan Jakarta Selatan",
        logoUrl: "/partners/dinas-pendidikan-jaksel.png",
        order: 18,
      },

      // === Row 6: Corporate Partners ===
      {
        name: "Himpunan Pengusaha Muda Indonesia (HIPMI)",
        logoUrl: "/partners/hipmi.png",
        order: 19,
      },
      {
        name: "J99 Corp",
        logoUrl: "/partners/j99-corp.png",
        order: 20,
      },
      {
        name: "Cogindo",
        logoUrl: "/partners/cogindo.png",
        order: 21,
      },
      {
        name: "Pos Indonesia",
        logoUrl: "/partners/pos-indonesia.png",
        order: 22,
      },
      {
        name: "APJI",
        logoUrl: "/partners/apji.png",
        order: 23,
      },
    ];

    for (const partner of partnersData) {
      await db.insert(partners).values(partner);
      console.log(`✅ Created partner: ${partner.name}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Partners data seeded successfully!");
    console.log("=".repeat(50));
    console.log(`\n📋 ${partnersData.length} partners created`);

  } catch (error) {
    console.error("\n❌ Error seeding partners data:", error);
    throw error;
  }
}

seedPartners()
  .then(() => {
    console.log("\n✅ Partners seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Partners seed script failed:", error);
    process.exit(1);
  });