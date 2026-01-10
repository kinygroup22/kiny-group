// scripts/reset.ts

import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Neon and Drizzle
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function resetDatabase() {
  console.log("🔴 Resetting database...");

  try {
    console.log("Finding all tables to drop...");

    // Query to get all table names in the 'public' schema
    const foundTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;

    if (foundTables.length === 0) {
      console.log("No tables found to drop.");
    } else {
      console.log(`Found ${foundTables.length} tables. Dropping them now...`);
      
      // Drop each table individually with CASCADE
      for (const table of foundTables) {
        const tableName = table.table_name;
        await sql`DROP TABLE IF EXISTS ${sql.unsafe(tableName)} CASCADE`;
      }
      
      console.log(`✅ Successfully dropped ${foundTables.length} tables.`);
    }

    console.log("Running migrations to recreate tables...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully.");

    console.log("🟢 Database has been reset!");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();