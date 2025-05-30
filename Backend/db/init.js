import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL commands
    await pool.query(sql);
    console.log("Database initialized successfully");

    // Create admin user
    const adminEmail = "admin@example.com";
    const adminPassword = "adminPassword123"; // You should use a strong password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const createAdminQuery = `
            INSERT INTO users (name, "emailaddress", password, "isAdmin")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("emailaddress") DO UPDATE
            SET "isAdmin" = EXCLUDED."isAdmin"
            RETURNING id;
        `;

    const result = await pool.query(createAdminQuery, [
      "Admin User",
      adminEmail,
      hashedPassword,
      true,
    ]);
    console.log(`Admin user created or updated with ID: ${result.rows[0].id}`);
    if (result.rows.length === 0) {
      console.error("Admin not created or updated.");
    } else {
      console.log(
        `Admin user created or updated with ID: ${result.rows[0].id}`
      );
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();
