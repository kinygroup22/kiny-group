// scripts/seed-team-departments.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  departments,
  teamMembers,
  users
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedTeamAndDepartments() {
  console.log("Seeding team members and departments...");

  try {
    const [adminUser] = await db.select().from(users).where(eq(users.email, "nathalia@kcifoundation.org"));
    
    if (!adminUser) {
      console.error("Admin user not found. Please run the main seeder first to create users.");
      return;
    }

    console.log("Removing existing team members and departments...");
    await db.delete(teamMembers);
    await db.delete(departments);

    // Seed Departments
    console.log("Seeding departments...");
    const departmentsData = [
      {
        name: "Executive",
        head: "Kiki Sari",
        description: "Executive leadership and strategic direction",
        color: "from-blue-500 to-blue-600",
        order: 0,
      },
    ];

    const insertedDepartments = [];
    for (const departmentData of departmentsData) {
      const [newDepartment] = await db.insert(departments).values(departmentData).returning();
      insertedDepartments.push(newDepartment);
    }

    // Seed Team Members — Founder only
    console.log("Seeding team members...");
    const teamMembersData = [
      {
        name: "Kiki Sari",
        title: "Founder & CEO",
        bio: "Visionary leader and founder of KCI Foundation, driving excellence across education, cultural exchange, tourism, and community development initiatives.",
        image: "/teams/founder.png",
        role: "founder",
        departmentId: insertedDepartments[0].id,
        order: 0,
        icon: "Award",
        achievements: [
          "Founded KCI Foundation",
          "Established 8 brand divisions",
          "Built partnerships across 167 countries",
        ],
      },
    ];

    for (const memberData of teamMembersData) {
      await db.insert(teamMembers).values(memberData);
      console.log(`✅ Created team member: ${memberData.name}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Team members and departments seeded successfully!");
    console.log("=".repeat(50));
    console.log(`\n📋 ${insertedDepartments.length} department(s), ${teamMembersData.length} team member(s) created`);

  } catch (error) {
    console.error("\n❌ Error seeding team members and departments:", error);
    throw error;
  }
}

seedTeamAndDepartments()
  .then(() => {
    console.log("\n✅ Team seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Team seed script failed:", error);
    process.exit(1);
  });