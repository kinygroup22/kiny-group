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
  blogComments,
  blogPostLikes,
  blogPostViews,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding database...");

  try {
    // Create or get admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: userRoles.ADMIN,
    }).onConflictDoNothing();
    
    const [adminUser] = await db.select().from(users).where(eq(users.email, "admin@example.com"));

    // Create or get editor user
    const editorPassword = await bcrypt.hash("editor123", 10);
    await db.insert(users).values({
      name: "Editor User",
      email: "editor@example.com",
      password: editorPassword,
      role: userRoles.EDITOR,
    }).onConflictDoNothing();
    
    const [editorUser] = await db.select().from(users).where(eq(users.email, "editor@example.com"));

    // Create or get contributor user
    const contributorPassword = await bcrypt.hash("contributor123", 10);
    await db.insert(users).values({
      name: "Contributor User",
      email: "contributor@example.com",
      password: contributorPassword,
      role: userRoles.CONTRIBUTOR,
    }).onConflictDoNothing();
    
    const [contributorUser] = await db.select().from(users).where(eq(users.email, "contributor@example.com"));

    // Create or get regular user
    const readerPassword = await bcrypt.hash("reader123", 10);
    await db.insert(users).values({
      name: "Reader User",
      email: "reader@example.com",
      password: readerPassword,
      role: userRoles.READER,
    }).onConflictDoNothing();
    
    const [readerUser] = await db.select().from(users).where(eq(users.email, "reader@example.com"));

    // Create or get brand users
    const kinyCulturaPassword = await bcrypt.hash("kiny123", 10);
    await db.insert(users).values({
      name: "Kiny Cultura",
      email: "kiny.cultura@example.com",
      password: kinyCulturaPassword,
      role: userRoles.CONTRIBUTOR,
    }).onConflictDoNothing();
    
    const [kinyCulturaUser] = await db.select().from(users).where(eq(users.email, "kiny.cultura@example.com"));

    const kinyToursPassword = await bcrypt.hash("tours123", 10);
    await db.insert(users).values({
      name: "Kiny Tours",
      email: "kiny.tours@example.com",
      password: kinyToursPassword,
      role: userRoles.CONTRIBUTOR,
    }).onConflictDoNothing();
    
    const [kinyToursUser] = await db.select().from(users).where(eq(users.email, "kiny.tours@example.com"));

    // Create or get blog categories
    await db.insert(blogCategories).values({
      name: "Teknologi",
      slug: "teknologi",
      description: "Postingan tentang tren teknologi, inovasi, dan berita teknologi terkini",
    }).onConflictDoNothing();
    
    const [techCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "teknologi"));

    await db.insert(blogCategories).values({
      name: "Desain",
      slug: "desain",
      description: "Prinsip desain, UI/UX, dan seni visual",
    }).onConflictDoNothing();
    
    const [designCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "desain"));

    await db.insert(blogCategories).values({
      name: "Bisnis",
      slug: "bisnis",
      description: "Strategi bisnis, kewirausahaan, dan wawasan pasar",
    }).onConflictDoNothing();
    
    const [businessCategory] = await db.select().from(blogCategories).where(eq(blogCategories.slug, "bisnis"));

    // Create blog posts
    const posts = [
      {
        title: "Masa Depan Pengembangan Web",
        slug: "masa-depan-pengembangan-web",
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
        featuredImage: "https://picsum.photos/seed/webdev/1200/800.jpg",
        featured: true,
        authorId: adminUser.id,
        readTime: 5,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        title: "Sistem Desain: Membangun Pengalaman Pengguna yang Konsisten",
        slug: "sistem-desain-konsistensi",
        excerpt: "Bagaimana sistem desain membantu tim membuat antarmuka pengguna yang konsisten dan dapat diskalakan.",
        content: `
          <h2>Apa itu Sistem Desain?</h2>
          <p>Sistem desain adalah kumpulan komponen yang dapat digunakan kembali, dipandu oleh standar yang jelas, yang dapat dirakit bersama untuk membangun sejumlah aplikasi. Ini bukan hanya kit UI atau panduan gaya—ini adalah ekosistem lengkap yang mencakup prinsip desain, pedoman pengembangan, dan dokumentasi.</p>
          
          <h3>Manfaat Sistem Desain</h3>
          <ul>
            <li><strong>Konsistensi:</strong> Memastikan pengalaman yang kohesif di semua produk dan platform</li>
            <li><strong>Effisiensi:</strong> Mempercepat proses desain dan pengembangan</li>
            <li><strong>Skalabilitas:</strong> Memudahkan pemeliharaan dan perluasan produk</li>
            <li><strong>Kolaborasi:</strong> Meningkatkan komunikasi antara desainer dan pengembang</li>
          </ul>
          
          <h3>Komponen Kunci</h3>
          <p>Sistem desain yang komprehensif biasanya mencakup:</p>
          <ul>
            <li>Bahasa desain visual (warna, tipografi, spasi)</li>
            <li>Pustaka komponen (tombol, formulir, navigasi, dll.)</li>
            <li>Pustaka pola (solusi umum untuk masalah desain)</li>
            <li>Dokumentasi dan pedoman</li>
            <li>Alat desain dan pengembangan</li>
          </ul>
          
          <h3>Memulai</h3>
          <p>Membangun sistem desain adalah investasi yang signifikan, tetapi manfaat jangka panjangnya sangat besar. Mulailah dengan skala kecil, fokus pada kasus penggunaan yang paling umum, dan secara bertahap perluas sistem berdasarkan kebutuhan tim Anda.</p>
        `,
        featuredImage: "https://picsum.photos/seed/design/1200/800.jpg",
        featured: false,
        authorId: editorUser.id,
        readTime: 7,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: "Kerja Jarak Jauh: Normal Baru",
        slug: "kerja-jarak-jauh-normal-baru",
        excerpt: "Bagaimana kerja jarak jauh membentuk kembali budaya perusahaan dan produktivitas.",
        content: `
          <h2>Pergeseran ke Kerja Jarak Jauh</h2>
          <p>Pandemi global mempercepat adopsi kerja jarak jauh, mengubahnya dari fasilitas menjadi kebutuhan. Sekarang, saat kita maju, kerja jarak jauh telah menjadi normal baru bagi banyak perusahaan dan industri.</p>
          
          <h3>Manfaat Kerja Jarak Jauh</h3>
          <ul>
            <li><strong>Fleksibilitas:</strong> Karyawan menikmati keseimbangan kerja-hidup yang lebih baik</li>
            <li><strong>Pool Talenta:</strong> Perusahaan dapat merekrut dari mana saja di dunia</li>
            <li><strong>Penghematan Biaya:</strong> Overhead yang berkurang untuk ruang kantor dan utilitas</li>
            <li><strong>Produktivitas:</strong> Banyak karyawan melaporkan produktivitas yang lebih tinggi saat bekerja dari jarak jauh</li>
          </ul>
          
          <h3>Tantangan yang Harus Diatasi</h3>
          <p>Meskipun kerja jarak jauh menawarkan banyak manfaat, ini tidak tanpa tantangan:</p>
          <ul>
            <li>Mempertahankan budaya perusahaan dan kohesi tim</li>
            <li>Memastikan komunikasi dan kolaborasi yang efektif</li>
            <li>Memberikan dukungan teknis dan sumber daya yang memadai</li>
            <li>Mengelola kinerja dan akuntabilitas</li>
          </ul>
          
          <h3>Praktik Terbaik untuk Tim Jarak Jauh</h3>
          <p>Untuk berhasil dengan kerja jarak jauh, perusahaan harus:</p>
          <ul>
            <li>Menginvestasikan alat kolaborasi yang andal</li>
            <li>Membuat pedoman komunikasi yang jelas</li>
            <li>Secara rutin memeriksa anggota tim</li>
            <li>Menciptakan peluang untuk interaksi sosial</li>
            <li>Mempercayai karyawan dan fokus pada hasil</li>
          </ul>
        `,
        featuredImage: "https://picsum.photos/seed/remote/1200/800.jpg",
        featured: true,
        authorId: contributorUser.id,
        readTime: 6,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: "AI dalam Bisnis: Peluang dan Tantangan",
        slug: "ai-bisnis-peluang-tantangan",
        excerpt: "Mengeksplorasi bagaimana kecerdasan buatan mengubah operasi dan strategi bisnis.",
        content: `
          <h2>Revolusi AI dalam Bisnis</h2>
          <p>Kecerdasan buatan tidak lagi sekadar buzzword—ini adalah teknologi transformatif yang membentuk kembali cara bisnis beroperasi, membuat keputusan, dan melayani pelanggan.</p>
          
          <h3>Aplikasi Kunci</h3>
          <ul>
            <li><strong>Layanan Pelanggan:</strong> Chatbot dan asisten virtual bertenaga AI</li>
            <li><strong>Analitik Prediktif:</strong> Memprediksi tren dan perilaku pelanggan</li>
            <li><strong>Otomatisasi Proses:</strong> Menyederhanakan tugas-tugas berulang</li>
            <li><strong>Personalisasi:</strong> Menyesuaikan produk dan layanan</li>
          </ul>
          
          <h3>Tantangan Implementasi</h3>
          <p>Meskipun manfaat potensialnya, bisnis menghadapi beberapa tantangan saat mengimplementasikan AI:</p>
          <ul>
            <li>Kualitas dan ketersediaan data</li>
            <li>Kekurangan talenta dan kesenjangan keterampilan</li>
            <li>Pertimbangan etika dan bias</li>
            <li>Integrasi dengan sistem yang ada</li>
          </ul>
          
          <h3>Faktor Keberhasilan</h3>
          <p>Implementasi AI yang berhasil memerlukan:</p>
          <ul>
            <li>Tujuan bisnis yang jelas</li>
            <li>Dukungan eksekutif dan investasi</li>
            <li>Pendekatan bertahap dengan kemenangan cepat</li>
            <li>Pemantauan dan peningkatan berkelanjutan</li>
          </ul>
        `,
        featuredImage: "https://picsum.photos/seed/aibusiness/1200/800.jpg",
        featured: false,
        authorId: adminUser.id,
        readTime: 8,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: "Praktik Terbaik Keamanan Siber untuk 2023",
        slug: "keamanan-siber-praktik-terbaik-2023",
        excerpt: "Langkah-langkah keamanan esensial yang harus diimplementasikan setiap bisnis untuk melindungi dari ancaman siber.",
        content: `
          <h2>Pentingnya Keamanan Siber yang Terus Tumbuh</h2>
          <p>Saat bisnis semakin mengandalkan infrastruktur digital, keamanan siber telah menjadi perhatian kritis. Serangan siber menjadi lebih canggih, dan konsekuensi dari pelanggaran dapat merusak.</p>
          
          <h3>Langkah-langkah Keamanan Esensial</h3>
          <ul>
            <li><strong>Autentikasi Multi-Faktor:</strong> Tambahkan lapisan keamanan ekstra ke semua akun</li>
            <li><strong>Pembaruan Reguler:</strong> Pertahankan semua perangkat lunak dan sistem tetap terkini</li>
            <li><strong>Pelatihan Karyawan:</strong> Edukasi staf tentang praktik keamanan terbaik</li>
            <li><strong>Enkripsi Data:</strong> Lindungi informasi sensitif baik dalam transit maupun saat diam</li>
          </ul>
          
          <h3>Perencanaan Respons Insiden</h3>
          <p>Setiap bisnis harus memiliki rencana respons insiden yang mencakup:</p>
          <ul>
            <li>Peran dan tanggung jawab yang jelas</li>
            <li>Protokol komunikasi</li>
            <li>Prosedur pemulihan</li>
            <li>Analisis pasca-insiden</li>
          </ul>
          
          <h3>Tetap Selangkah di Depan Ancaman</h3>
          <p>Keamanan siber adalah proses berkelanjutan. Tetap informasikan tentang:</p>
          <ul>
            <li>Ancaman dan kerentanan yang muncul</li>
            <li>Teknologi dan solusi keamanan baru</li>
            <li>Persyaratan dan kepatuhan regulasi</li>
            <li>Praktik terbaik industri</li>
          </ul>
        `,
        featuredImage: "https://picsum.photos/seed/security/1200/800.jpg",
        featured: true,
        authorId: editorUser.id,
        readTime: 6,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    // Insert posts and assign categories
    for (const postData of posts) {
      // Check if post already exists
      const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, postData.slug));
      
      if (existingPost.length === 0) {
        const [newPost] = await db.insert(blogPosts).values(postData).returning();
        
        // Assign categories to posts
        if (postData.slug === "masa-depan-pengembangan-web") {
          await db.insert(blogPostCategories).values([
            { postId: newPost.id, categoryId: techCategory.id },
            { postId: newPost.id, categoryId: designCategory.id }
          ]);
        } else if (postData.slug === "sistem-desain-konsistensi") {
          await db.insert(blogPostCategories).values([
            { postId: newPost.id, categoryId: designCategory.id },
            { postId: newPost.id, categoryId: techCategory.id }
          ]);
        } else if (postData.slug === "kerja-jarak-jauh-normal-baru") {
          await db.insert(blogPostCategories).values([
            { postId: newPost.id, categoryId: businessCategory.id }
          ]);
        } else if (postData.slug === "ai-bisnis-peluang-tantangan") {
          await db.insert(blogPostCategories).values([
            { postId: newPost.id, categoryId: businessCategory.id },
            { postId: newPost.id, categoryId: techCategory.id }
          ]);
        } else if (postData.slug === "keamanan-siber-praktik-terbaik-2023") {
          await db.insert(blogPostCategories).values([
            { postId: newPost.id, categoryId: techCategory.id },
            { postId: newPost.id, categoryId: businessCategory.id }
          ]);
        }
      }
    }

    // Get all posts
    const createdPosts = await db.select().from(blogPosts);
    
    // Add some sample comments
    for (const post of createdPosts.slice(0, 3)) {
      // Check if comments already exist
      const existingComments = await db.select().from(blogComments).where(eq(blogComments.postId, post.id));
      
      if (existingComments.length === 0) {
        await db.insert(blogComments).values([
          {
            postId: post.id,
            authorId: readerUser.id,
            content: "Artikel yang sangat bagus! Ini sangat membantu dan informatif."
          },
          {
            postId: post.id,
            authorId: contributorUser.id,
            content: "Terima kasih telah berbagi. Saya belajar sesuatu yang baru hari ini."
          }
        ]);
      }
    }

    // Add some likes and views
    for (const post of createdPosts) {
      // Check if likes already exist
      const existingLikes = await db.select().from(blogPostLikes).where(eq(blogPostLikes.postId, post.id));
      
      if (existingLikes.length === 0) {
        // Add likes from different users
        await db.insert(blogPostLikes).values([
          { postId: post.id, userId: readerUser.id },
          { postId: post.id, userId: contributorUser.id }
        ]);
      }
      
      // Check if views already exist
      const existingViews = await db.select().from(blogPostViews).where(eq(blogPostViews.postId, post.id));
      
      if (existingViews.length === 0) {
        // Add views
        await db.insert(blogPostViews).values([
          { postId: post.id, userId: readerUser.id },
          { postId: post.id, userId: contributorUser.id },
          { postId: post.id, ipAddress: "192.168.1.1" },
          { postId: post.id, ipAddress: "192.168.1.2" }
        ]);
      }
    }

    console.log("Database seeded successfully!");
    console.log("\nNOTE: Run 'npm run seed:brands' to seed brand divisions data");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@example.com / admin123");
    console.log("Editor: editor@example.com / editor123");
    console.log("Contributor: contributor@example.com / contributor123");
    console.log("Reader: reader@example.com / reader123");
    console.log("Kiny Cultura: kiny.cultura@example.com / kiny123");
    console.log("Kiny Tours: kiny.tours@example.com / tours123");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();