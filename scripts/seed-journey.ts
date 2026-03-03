// scripts/seed-journey.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { journeyItems } from "@/lib/db/schema";

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedJourney() {
  console.log("Seeding journey data...");

  try {
    // Clear existing journey data
    console.log("Clearing existing journey data...");
    await db.delete(journeyItems);
    console.log("✅ Cleared existing journey items");

    const journeyData = [
      {
        year: "2012",
        title: "Kinytours Founded",
        description: "Kiny Group memulai perjalanannya dengan mendirikan Kinytours, memberikan layanan wisata berkualitas tinggi untuk pelanggan domestik dan internasional.",
        imageUrl: "/assets/about/journey/1.png",
        order: 0,
      },
      {
        year: "2013",
        title: "Kiny Cultura & CID Partnership",
        description: "Kiny Cultura resmi berdiri dengan kerjasama eksklusif bersama Conseil International de la Danse (CID), membuka pintu kolaborasi seni dan budaya internasional.",
        imageUrl: "/assets/about/journey/2.png",
        order: 1,
      },
      {
        year: "2014",
        title: "Kiny X Plore",
        description: "Peluncuran Kiny X Plore memperluas jangkauan layanan eksplorasi dan petualangan, menghadirkan pengalaman unik bagi para pelanggan yang ingin menjelajahi dunia.",
        imageUrl: "/assets/about/journey/3.png",
        order: 2,
      },
      {
        year: "2015",
        title: "Kiny Souls",
        description: "Kiny Souls hadir sebagai divisi yang berfokus pada pengembangan diri dan perjalanan spiritual, melengkapi ekosistem layanan Kiny Group.",
        imageUrl: "/assets/about/journey/4.png",
        order: 3,
      },
      {
        year: "2021",
        title: "CSR Sustainability — Yuk Group",
        description: "Kiny Group meluncurkan program CSR dan keberlanjutan perusahaan bersama Yuk Group, memperkuat komitmen terhadap tanggung jawab sosial dan lingkungan.",
        imageUrl: "/assets/about/journey/5.png",
        order: 4,
      },
      {
        year: "2022",
        title: "CSR Sustainability — GPB",
        description: "Memperluas program CSR melalui kemitraan strategis dengan GPB, memperkuat dampak sosial dan keberlanjutan di komunitas yang lebih luas.",
        imageUrl: "/assets/about/journey/6.png",
        order: 5,
      },
      {
        year: "2023",
        title: "Kiny Education",
        description: "Lahirnya Kiny Education menandai langkah besar Kiny Group ke dunia pendidikan internasional, menyediakan program pendidikan berkualitas tinggi yang diakui secara global.",
        imageUrl: "/assets/about/journey/7.png",
        order: 6,
      },
      {
        year: "2025",
        title: "Kiny Project",
        description: "Kiny Project hadir sebagai inisiatif terbaru Kiny Group, mendorong inovasi dan kolaborasi lintas divisi untuk mewujudkan visi masa depan yang lebih besar.",
        imageUrl: "/assets/about/journey/8.png",
        order: 7,
      },
    ];

    for (const item of journeyData) {
      await db.insert(journeyItems).values(item);
      console.log(`✅ Created journey item: ${item.year} - ${item.title}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Journey data seeded successfully!");
    console.log("=".repeat(50));
    console.log(`\n📋 ${journeyData.length} journey items created`);

  } catch (error) {
    console.error("\n❌ Error seeding journey data:", error);
    throw error;
  }
}

seedJourney()
  .then(() => {
    console.log("\n✅ Journey seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Journey seed script failed:", error);
    process.exit(1);
  });