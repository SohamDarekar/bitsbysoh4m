import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup proper paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== DB CONNECTION TESTER ===");
console.log("Current directory:", __dirname);

// Try to load .env from multiple locations
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check environment
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set (hidden for security)" : "Not set");
console.log("MONGODB_DB_NAME:", process.env.MONGODB_DB_NAME || "Not set");

if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined! Check your .env file");
  process.exit(1);
}

// Test database connection
try {
  console.log("Attempting to import db.js...");
  import('./db.js')
    .then(async ({ getDb, closeDb }) => {
      console.log("Successfully imported db.js");
      try {
        console.log("Attempting database connection...");
        const db = await Promise.race([
          getDb(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout after 5000ms')), 5000)
          )
        ]);
        console.log("✅ Successfully connected to MongoDB!");
        console.log("Database connection works!");
        await closeDb();
        console.log("Connection closed.");
      } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        if (error.message.includes("MongoNetworkError") || error.message.includes("timeout")) {
          console.log("NETWORK ISSUE: Check your internet connection and MongoDB Atlas status");
        }
      }
    })
    .catch(error => {
      console.error("❌ Failed to import db.js:", error.message);
    });
} catch (error) {
  console.error("❌ Critical error:", error.message);
}
