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

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedTeamAndDepartments() {
  console.log("Seeding team members and departments...");

  try {
    // Get admin user for authorId
    const [adminUser] = await db.select().from(users).where(eq(users.email, "admin@example.com"));
    
    if (!adminUser) {
      console.error("Admin user not found. Please run the main seeder first to create users.");
      return;
    }

    // Delete existing team members and departments
    console.log("Removing existing team members and departments...");
    await db.delete(teamMembers);
    await db.delete(departments);

    // Seed Departments
    console.log("Seeding departments...");
    const departmentsData = [
      {
        name: "Education Services",
        head: "Dr. Sarah Wijaya",
        description: "Mengelola semua program pendidikan dan kurikulum",
        color: "from-blue-500 to-blue-600",
        order: 0,
      },
      {
        name: "Cultural Exchange",
        head: "Budi Santoso",
        description: "Menyelenggarakan program pertukaran budaya internasional",
        color: "from-purple-500 to-purple-600",
        order: 1,
      },
      {
        name: "Student Services",
        head: "Andi Pratama",
        description: "Memberikan dukungan dan layanan untuk siswa",
        color: "from-green-500 to-green-600",
        order: 2,
      },
      {
        name: "Operations",
        head: "Diana Kusuma",
        description: "Mengelola operasional harian dan logistik",
        color: "from-orange-500 to-orange-600",
        order: 3,
      }
    ];

    // Insert departments
    const insertedDepartments = [];
    for (const departmentData of departmentsData) {
      const [newDepartment] = await db.insert(departments).values(departmentData).returning();
      insertedDepartments.push(newDepartment);
    }

    // Seed Team Members
    console.log("Seeding team members...");
    const teamMembersData = [
      {
        name: "Dr. Kiny Anderson",
        title: "Founder & CEO",
        bio: "Visionary leader dengan 15+ tahun pengalaman di bidang pendidikan internasional. Memiliki gelar PhD dalam Pendidikan Internasional dari University of Cambridge.",
        image: "/images/team/founder.jpg",
        role: "founder",
        departmentId: insertedDepartments[0].id, // Education Services
        order: 0,
        icon: "Award",
        achievements: [
          "International Education Award 2020",
          "UNESCO Recognition 2019",
          "Best Education Leader 2018"
        ],
      },
      {
        name: "Sarah Wijaya",
        title: "Chief Operating Officer",
        bio: "Profesional berpengalaman dengan 10+ tahun di bidang operasional dan manajemen. Fokus pada efisiensi proses dan pengembangan tim.",
        image: "/images/team/coo.jpg",
        role: "executive",
        departmentId: insertedDepartments[3].id, // Operations
        order: 1,
        icon: "Briefcase",
        achievements: [
          "Operations Excellence Award 2021",
          "Team Leadership Recognition 2020"
        ],
      },
      {
        name: "Budi Santoso",
        title: "Director of Education",
        bio: "Ahli pendidikan dengan spesialisasi dalam kurikulum internasional. Memiliki pengalaman mengembangkan program edukasi inovatif.",
        image: "/images/team/director-edu.jpg",
        role: "executive",
        departmentId: insertedDepartments[0].id, // Education Services
        order: 2,
        icon: "GraduationCap",
        achievements: [
          "Curriculum Innovation Award 2021",
          "Education Excellence Recognition 2020"
        ],
      },
      {
        name: "Andi Pratama",
        title: "Head of Partnerships",
        bio: "Jaringan profesional dengan koneksi global. Bertanggung jawab atas pengembangan kemitraan strategis dengan institusi pendidikan.",
        image: "/images/team/head-partnerships.jpg",
        role: "executive",
        departmentId: insertedDepartments[1].id, // Cultural Exchange
        order: 3,
        icon: "Users",
        achievements: [
          "Partnership Development Award 2021",
          "Global Network Builder 2020"
        ],
      },
      {
        name: "Diana Kusuma",
        title: "Operations Manager",
        bio: "Manajer operasional dengan fokus pada peningkatan efisiensi dan kualitas layanan.",
        image: "/images/team/ops-manager.jpg",
        role: "team_member",
        departmentId: insertedDepartments[3].id, // Operations
        order: 4,
        icon: "Briefcase",
        achievements: [],
      },
      {
        name: "Ahmad Fadli",
        title: "Program Coordinator",
        bio: "Koordinator program dengan pengalaman dalam mengelola berbagai jenis program pendidikan dan pertukaran budaya.",
        image: "/images/team/program-coordinator.jpg",
        role: "team_member",
        departmentId: insertedDepartments[0].id, // Education Services
        order: 5,
        icon: "Target",
        achievements: [],
      },
      {
        name: "Maria Santos",
        title: "Student Advisor",
        bio: "Penasihat siswa yang berdedikasi untuk membantu siswa mencapai potensi penuh mereka.",
        image: "/images/team/student-advisor.jpg",
        role: "team_member",
        departmentId: insertedDepartments[2].id, // Student Services
        order: 6,
        icon: "Users",
        achievements: [],
      },
      {
        name: "Raj Patel",
        title: "Cultural Exchange Coordinator",
        bio: "Koordinator pertukaran budaya dengan pengalaman dalam mengorganisir program lintas budaya.",
        image: "/images/team/cultural-coordinator.jpg",
        role: "team_member",
        departmentId: insertedDepartments[1].id, // Cultural Exchange
        order: 7,
        icon: "Globe",
        achievements: [],
      }
    ];

    // Insert team members
    for (const memberData of teamMembersData) {
      await db.insert(teamMembers).values(memberData);
    }

    console.log("Team members and departments seeded successfully!");
  } catch (error) {
    console.error("Error seeding team members and departments:", error);
  }
}

seedTeamAndDepartments();