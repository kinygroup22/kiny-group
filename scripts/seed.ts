// scripts/seed.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  users, 
  userRoles, 
  blogPosts, 
  blogCategories, 
  blogPostCategories,
  eventRegistrations
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // ==================== CREATE USERS ====================
    console.log("👥 Creating users...");
    
    // Admin Users
    const thoriqPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      name: "Thoriq",
      email: "thoriq@kcifoundation.org",
      password: thoriqPassword,
      role: userRoles.ADMIN,
    }).onConflictDoNothing();
    
    const [thoriqAdmin] = await db.select().from(users).where(eq(users.email, "thoriq@kcifoundation.org"));
    console.log("✅ Thoriq admin user created");

    const nathaliaPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      name: "Nathalia",
      email: "nathalia@kcifoundation.org",
      password: nathaliaPassword,
      role: userRoles.ADMIN,
    }).onConflictDoNothing();
    
    const [nathaliaAdmin] = await db.select().from(users).where(eq(users.email, "nathalia@kcifoundation.org"));
    console.log("✅ Nathalia admin user created");

    // Editor User
    const editorPassword = await bcrypt.hash("editor123", 10);
    await db.insert(users).values({
      name: "Editor User",
      email: "editor@example.com",
      password: editorPassword,
      role: userRoles.EDITOR,
    }).onConflictDoNothing();
    
    const [editorUser] = await db.select().from(users).where(eq(users.email, "editor@example.com"));
    console.log("✅ Editor user created");

    // Contributor User
    const contributorPassword = await bcrypt.hash("contributor123", 10);
    await db.insert(users).values({
      name: "Contributor User",
      email: "contributor@example.com",
      password: contributorPassword,
      role: userRoles.CONTRIBUTOR,
    }).onConflictDoNothing();
    
    const [contributorUser] = await db.select().from(users).where(eq(users.email, "contributor@example.com"));
    console.log("✅ Contributor user created");

    // Reader User
    const readerPassword = await bcrypt.hash("reader123", 10);
    await db.insert(users).values({
      name: "Reader User",
      email: "reader@example.com",
      password: readerPassword,
      role: userRoles.READER,
    }).onConflictDoNothing();
    
    const [readerUser] = await db.select().from(users).where(eq(users.email, "reader@example.com"));
    console.log("✅ Reader user created");

    // ==================== CREATE CATEGORIES ====================
    console.log("\n📁 Creating categories...");
    
    await db.insert(blogCategories).values({
      name: "Teknologi",
      slug: "teknologi",
      description: "Artikel tentang tren teknologi, inovasi, dan berita teknologi terkini",
    }).onConflictDoNothing();
    
    const [techCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "teknologi"));
    console.log("✅ Technology category created");

    await db.insert(blogCategories).values({
      name: "Pendidikan",
      slug: "pendidikan",
      description: "Artikel dan konten edukatif",
    }).onConflictDoNothing();
    
    const [educationCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "pendidikan"));
    console.log("✅ Education category created");

    await db.insert(blogCategories).values({
      name: "Event",
      slug: "event",
      description: "Acara, webinar, dan workshop yang akan datang",
    }).onConflictDoNothing();
    
    const [eventCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "event"));
    console.log("✅ Event category created");

    // ==================== CREATE BLOG POSTS ====================
    console.log("\n📝 Creating blog posts...");

    // Regular Blog Post
    const regularPostSlug = "masa-depan-pengembangan-web";
    const existingRegularPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, regularPostSlug));
    
    let regularPost;
    if (existingRegularPost.length === 0) {
      [regularPost] = await db.insert(blogPosts).values({
        title: "Masa Depan Pengembangan Web",
        slug: regularPostSlug,
        excerpt: "Mengeksplorasi tren dan teknologi yang sedang berkembang yang membentuk masa depan pengembangan web.",
        content: `
          <h2>Lanskap Pengembangan Web yang Terus Berkembang</h2>
          <p>Pengembangan web telah berkembang pesat sejak hari-hari awal halaman HTML statis. Aplikasi web saat ini kompleks, interaktif, dan mampu memberikan pengalaman yang setara dengan aplikasi native.</p>
          
          <h3>Tren Kunci yang Perlu Diperhatikan</h3>
          <ul>
            <li><strong>Arsitektur JAMstack:</strong> JavaScript, APIs, dan Markup mendefinisikan ulang cara kita membangun aplikasi web.</li>
            <li><strong>WebAssembly:</strong> Membawa performa mendekati native ke aplikasi web.</li>
            <li><strong>Integrasi AI:</strong> Memanfaatkan pembelajaran mesin langsung di browser.</li>
            <li><strong>Edge Computing:</strong> Memindahkan komputasi lebih dekat ke pengguna untuk pengalaman yang lebih cepat.</li>
          </ul>
          
          <h3>Kebangkitan Framework</h3>
          <p>Framework modern seperti React, Vue, dan Angular terus berkembang, menawarkan pengembang alat yang kuat untuk membangun aplikasi kompleks. Ekosistem di sekitar framework ini, termasuk solusi manajemen state dan pustaka komponen, telah matang secara signifikan.</p>
          
          <h3>Melihat ke Masa Depan</h3>
          <p>Saat kita melihat ke masa depan, kita dapat mengharapkan pengembangan web menjadi lebih spesialisasi, dengan perbedaan yang jelas antara peran frontend, backend, dan full-stack. Alat akan terus meningkat, membuat pengembangan lebih efisien sambil memungkinkan aplikasi yang semakin canggih.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop",
        featured: true,
        isEvent: false,
        authorId: thoriqAdmin.id, // Using thoriqAdmin instead of adminUser
        category: "Teknologi",
        readTime: 5,
        views: 0,
        likes: 0,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        // Event fields should be null for regular posts
        eventStartDate: null,
        eventEndDate: null,
        eventLocation: null,
        eventMaxParticipants: null,
        eventIsActive: false,
      }).returning();
      
      // Assign technology category
      await db.insert(blogPostCategories).values({
        postId: regularPost.id,
        categoryId: techCategory.id
      });
      
      console.log("✅ Regular blog post created: Masa Depan Pengembangan Web");
    } else {
      regularPost = existingRegularPost[0];
      console.log("ℹ️  Regular blog post already exists");
    }

    // Event Post
    const eventPostSlug = "workshop-web-development-2025";
    const existingEventPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, eventPostSlug));
    
    let eventPost;
    if (existingEventPost.length === 0) {
      const eventStartDate = new Date();
      eventStartDate.setDate(eventStartDate.getDate() + 14); // 14 days from now
      eventStartDate.setHours(14, 0, 0, 0); // 2:00 PM
      
      const eventEndDate = new Date(eventStartDate);
      eventEndDate.setHours(17, 0, 0, 0); // 5:00 PM (3 hours duration)
      
      [eventPost] = await db.insert(blogPosts).values({
        title: "Workshop: Membangun Aplikasi Web Modern dengan React & Next.js",
        slug: eventPostSlug,
        excerpt: "Bergabunglah dengan workshop intensif 3 jam untuk belajar membangun aplikasi web modern menggunakan React dan Next.js dari ahlinya.",
        content: `
          <h2>Tentang Workshop</h2>
          <p>Workshop intensif ini dirancang untuk developer yang ingin menguasai pengembangan aplikasi web modern menggunakan React dan Next.js. Anda akan belajar langsung dari praktisi berpengalaman dan membangun proyek nyata selama workshop.</p>
          
          <h3>Yang Akan Anda Pelajari</h3>
          <ul>
            <li><strong>React Fundamentals:</strong> Komponen, Props, State, dan Hooks</li>
            <li><strong>Next.js Essentials:</strong> Routing, Server Components, dan API Routes</li>
            <li><strong>Styling Modern:</strong> Tailwind CSS dan Component Libraries</li>
            <li><strong>Database Integration:</strong> Menghubungkan aplikasi dengan database</li>
            <li><strong>Deployment:</strong> Deploy aplikasi Anda ke production</li>
          </ul>
          
          <h3>Siapa yang Harus Ikut</h3>
          <p>Workshop ini cocok untuk:</p>
          <ul>
            <li>Developer dengan pengalaman JavaScript dasar</li>
            <li>Frontend developer yang ingin upgrade skill</li>
            <li>Full-stack developer yang ingin belajar framework modern</li>
            <li>Mahasiswa IT yang ingin terjun ke web development</li>
          </ul>
          
          <h3>Persyaratan</h3>
          <ul>
            <li>Laptop dengan Node.js terinstall (v18 atau lebih baru)</li>
            <li>Code editor (VS Code direkomendasikan)</li>
            <li>Pemahaman dasar JavaScript</li>
            <li>Koneksi internet yang stabil</li>
          </ul>
          
          <h3>Yang Akan Anda Dapatkan</h3>
          <ul>
            <li>🎯 Hands-on project yang bisa di-deploy langsung</li>
            <li>📚 Materi workshop lengkap dan source code</li>
            <li>🎓 Sertifikat digital setelah menyelesaikan workshop</li>
            <li>💬 Akses ke komunitas alumni untuk networking</li>
            <li>🎁 Bonus template dan resources untuk proyek Anda</li>
          </ul>
          
          <h3>Jadwal Workshop</h3>
          <p><strong>Durasi:</strong> 3 jam (14:00 - 17:00 WIB)</p>
          <p><strong>Format:</strong> Online via Zoom dengan sesi interaktif</p>
          <p><strong>Bahasa:</strong> Bahasa Indonesia</p>
          
          <h3>Tentang Instruktur</h3>
          <p>Workshop ini akan dipandu oleh tim developer berpengalaman dengan lebih dari 5 tahun pengalaman membangun aplikasi web skala enterprise menggunakan React dan Next.js.</p>
          
          <blockquote>
            <p>"Workshop yang sangat praktis! Saya langsung bisa apply ilmunya di project kantor." - Alumni Workshop Batch 1</p>
          </blockquote>
          
          <h3>Informasi Penting</h3>
          <p>🔥 <strong>Kuota Terbatas:</strong> Hanya 50 peserta untuk memastikan kualitas interaksi</p>
          <p>⏰ <strong>Early Bird:</strong> Daftar sekarang dan dapatkan akses ke pre-workshop preparation materials</p>
          <p>💡 Link Zoom akan dikirim via email H-1 sebelum workshop</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=800&fit=crop",
        featured: true,
        isEvent: true,
        authorId: nathaliaAdmin.id, // Using nathaliaAdmin instead of editorUser
        category: "Event",
        readTime: 3,
        views: 0,
        likes: 0,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        // Event-specific fields
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
        eventLocation: "Online (Zoom Meeting)",
        eventMaxParticipants: 50,
        eventIsActive: true,
        eventRegistrationForm: [
          { 
            name: "name", 
            label: "Nama Lengkap", 
            type: "text", 
            required: true, 
            placeholder: "Contoh: Ahmad Budiman" 
          },
          { 
            name: "email", 
            label: "Email", 
            type: "email", 
            required: true, 
            placeholder: "email@example.com" 
          },
          { 
            name: "phone", 
            label: "Nomor WhatsApp", 
            type: "tel", 
            required: true, 
            placeholder: "08123456789" 
          },
          { 
            name: "experience", 
            label: "Tingkat Pengalaman", 
            type: "select", 
            required: true, 
            options: [
              "Pemula (< 1 tahun)", 
              "Menengah (1-3 tahun)", 
              "Advanced (> 3 tahun)"
            ],
            placeholder: "Pilih tingkat pengalaman Anda"
          },
          { 
            name: "motivation", 
            label: "Apa motivasi Anda mengikuti workshop ini?", 
            type: "textarea", 
            required: true, 
            placeholder: "Ceritakan motivasi Anda..."
          },
          { 
            name: "laptop", 
            label: "Apakah Anda memiliki laptop dengan spesifikasi yang diperlukan?", 
            type: "radio", 
            required: true, 
            options: ["Ya", "Tidak"] 
          }
        ],
      }).returning();
      
      // Assign event and education categories
      await db.insert(blogPostCategories).values([
        {
          postId: eventPost.id,
          categoryId: eventCategory.id
        },
        {
          postId: eventPost.id,
          categoryId: educationCategory.id
        }
      ]);
      
      console.log("✅ Event post created: Workshop Web Development 2025");

      // ==================== CREATE SAMPLE REGISTRATIONS ====================
      console.log("\n👨‍💼 Creating sample event registrations...");
      
      await db.insert(eventRegistrations).values([
        {
          postId: eventPost.id,
          userId: readerUser.id,
          registrationData: {
            name: "Reader User",
            email: "reader@example.com",
            phone: "081234567890",
            experience: "Pemula (< 1 tahun)",
            motivation: "Saya ingin belajar framework modern untuk meningkatkan karir sebagai developer.",
            laptop: "Ya"
          }
        },
        {
          postId: eventPost.id,
          userId: contributorUser.id,
          registrationData: {
            name: "Contributor User",
            email: "contributor@example.com",
            phone: "081234567891",
            experience: "Menengah (1-3 tahun)",
            motivation: "Ingin upgrade skill dari React ke Next.js untuk project kantor.",
            laptop: "Ya"
          }
        },
        {
          postId: eventPost.id,
          userId: null, // Guest registration
          registrationData: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "081234567892",
            experience: "Pemula (< 1 tahun)",
            motivation: "Baru lulus kuliah dan ingin memulai karir sebagai web developer.",
            laptop: "Ya"
          }
        }
      ]);
      
      console.log("✅ 3 sample registrations created (2 users + 1 guest)");
    } else {
      eventPost = existingEventPost[0];
      console.log("ℹ️  Event post already exists");
    }

    // ==================== SUMMARY ====================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Database seeded successfully!");
    console.log("=".repeat(50));
    console.log("\n📋 Summary:");
    console.log("  • 5 users created (2 admins, editor, contributor, reader)");
    console.log("  • 3 categories created (teknologi, pendidikan, event)");
    console.log("  • 1 regular blog post created");
    console.log("  • 1 event post created with 3 sample registrations");
    
    console.log("\n🔑 Login Credentials:");
    console.log("┌─────────────┬──────────────────────────┬─────────────┐");
    console.log("│ Role        │ Email                    │ Password    │");
    console.log("├─────────────┼──────────────────────────┼─────────────┤");
    console.log("│ Admin       │ thoriq@kcifoundation.org │ admin123    │");
    console.log("│ Admin       │ nathalia@kcifoundation.org│ admin123    │");
    console.log("│ Editor      │ editor@example.com       │ editor123   │");
    console.log("│ Contributor │ contributor@example.com  │ contributor123 │");
    console.log("│ Reader      │ reader@example.com       │ reader123   │");
    console.log("└─────────────┴──────────────────────────┴─────────────┘");
    
    console.log("\n📅 Event Details:");
    console.log(`  • Event: ${eventPost.title}`);
    console.log(`  • Start: ${eventPost.eventStartDate?.toLocaleString('id-ID')}`);
    console.log(`  • End: ${eventPost.eventEndDate?.toLocaleString('id-ID')}`);
    console.log(`  • Location: ${eventPost.eventLocation}`);
    console.log(`  • Max Participants: ${eventPost.eventMaxParticipants}`);
    console.log(`  • Current Registrations: 3`);
    
    console.log("\n✨ Next Steps:");
    console.log("  1. Start your development server: npm run dev");
    console.log("  2. Login with any of the credentials above");
    console.log("  3. Visit /blog to see the posts");
    console.log("  4. Visit /events to see the workshop event");
    console.log("  5. Try registering for the event!");
    
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n✅ Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });