// scripts/seed-about.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  achievements,
  departments,
  teamMembers,
  clients,
  journeyItems,
  users
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedAboutPage() {
  console.log("Seeding About page data...");

  try {
    // Get admin user for authorId
    const [adminUser] = await db.select().from(users).where(eq(users.email, "admin@example.com"));
    
    if (!adminUser) {
      console.error("Admin user not found. Please run the main seeder first to create users.");
      return;
    }

    // Seed Achievements
    console.log("Seeding achievements...");
    const achievementsData = [
      {
        title: "Sertifikasi Internasional",
        description: "Diakui di lebih dari 170 negara",
        icon: "Award",
        order: 0,
        featured: true,
      },
      {
        title: "Jaringan Sekolah",
        description: "Kemitraan dengan sekolah di area JABODETABEK",
        icon: "Target",
        order: 1,
        featured: true,
      },
      {
        title: "1500+ Siswa",
        description: "Bekerja dengan lebih dari 1500 siswa",
        icon: "Users",
        order: 2,
        featured: true,
      },
      {
        title: "Program Kolaboratif",
        description: "Kolaborasi dengan pemerintah & UNESCO",
        icon: "Handshake",
        order: 3,
        featured: false,
      },
      {
        title: "Kemitraan Universitas",
        description: "Bekerja sama dengan universitas terkemuka di seluruh dunia",
        icon: "Globe",
        order: 4,
        featured: false,
      },
      {
        title: "Koneksi Internasional",
        description: "Koneksi yang kuat di sektor internasional",
        icon: "Sparkles",
        order: 5,
        featured: false,
      },
      {
        title: "Komitmen Pelanggan",
        description: "Bekerja dengan passion dan komitmen untuk memuaskan pelanggan",
        icon: "Heart",
        order: 6,
        featured: false,
      }
    ];

    // Insert achievements
    for (const achievementData of achievementsData) {
      // Check if achievement already exists
      const existingAchievement = await db.select().from(achievements).where(eq(achievements.title, achievementData.title));
      
      if (existingAchievement.length === 0) {
        await db.insert(achievements).values(achievementData);
      }
    }

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
      // Check if department already exists
      const existingDepartment = await db.select().from(departments).where(eq(departments.name, departmentData.name));
      
      if (existingDepartment.length === 0) {
        const [newDepartment] = await db.insert(departments).values(departmentData).returning();
        insertedDepartments.push(newDepartment);
      } else {
        insertedDepartments.push(existingDepartment[0]);
      }
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
      // Check if team member already exists
      const existingMember = await db.select().from(teamMembers).where(eq(teamMembers.name, memberData.name));
      
      if (existingMember.length === 0) {
        await db.insert(teamMembers).values(memberData);
      }
    }

    // Seed Clients
    console.log("Seeding clients...");
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
      }
    ];

    // Insert clients
    for (const clientData of clientsData) {
      // Check if client already exists
      const existingClient = await db.select().from(clients).where(eq(clients.name, clientData.name));
      
      if (existingClient.length === 0) {
        await db.insert(clients).values(clientData);
      }
    }

    // Seed Journey Items
    console.log("Seeding journey items...");
    const journeyItemsData = [
      {
        year: "2012",
        title: "Berdiri",
        description: "Kiny Group didirikan dengan visi untuk menyediakan layanan pendidikan internasional berkualitas tinggi.",
        imageUrl: "https://picsum.photos/seed/2012/800/600.jpg",
        order: 0,
      },
      {
        year: "2014",
        title: "Ekspansi Pertama",
        description: "Memperluas layanan ke 10 negara baru dan menjalin kemitraan dengan 20+ institusi pendidikan.",
        imageUrl: "https://picsum.photos/seed/2014/800/600.jpg",
        order: 1,
      },
      {
        year: "2016",
        title: "Penghargaan UNESCO",
        description: "Menerima pengakuan dari UNESCO untuk kontribusi dalam pendidikan lintas budaya.",
        imageUrl: "https://picsum.photos/seed/2016/800/600.jpg",
        order: 2,
      },
      {
        year: "2018",
        title: "Program Inovatif",
        description: "Meluncurkan program inovatif yang menggabungkan teknologi dengan pendidikan tradisional.",
        imageUrl: "https://picsum.photos/seed/2018/800/600.jpg",
        order: 3,
      },
      {
        year: "2020",
        title: "Adaptasi Pandemi",
        description: "Berhasil beradaptasi dengan pandemi global dengan mengembangkan platform pembelajaran online.",
        imageUrl: "https://picsum.photos/seed/2020/800/600.jpg",
        order: 4,
      },
      {
        year: "2022",
        title: "Milestone 1500 Siswa",
        description: "Mencapai milestone 1500+ siswa yang telah dilayani di seluruh dunia.",
        imageUrl: "https://picsum.photos/seed/2022/800/600.jpg",
        order: 5,
      },
      {
        year: "2023",
        title: "Ekspansi Global",
        description: "Memperluas jaringan ke 170+ negara dan menjalin kemitraan dengan universitas terkemuka.",
        imageUrl: "https://picsum.photos/seed/2023/800/600.jpg",
        order: 6,
      }
    ];

    // Insert journey items
    for (const journeyData of journeyItemsData) {
      // Check if journey item already exists
      const existingJourney = await db.select().from(journeyItems).where(eq(journeyItems.title, journeyData.title));
      
      if (existingJourney.length === 0) {
        await db.insert(journeyItems).values(journeyData);
      }
    }

    console.log("About page data seeded successfully!");
  } catch (error) {
    console.error("Error seeding About page data:", error);
  }
}

seedAboutPage();