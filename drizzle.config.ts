// drizzle.config.ts

// 1. Import dotenv at the top of the file
import dotenv from 'dotenv';
import type { Config } from "drizzle-kit";

// 2. Load environment variables from your .env.local file
dotenv.config({ path: '.env.local' });

export default {
  // 3. Double-check that this path is correct relative to your project root
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // This line will now correctly find the DATABASE_URL
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["users", "blog_posts", "blog_comments", "brand_divisions", "blog_categories", "blog_post_categories"],
} satisfies Config;