import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Use the same approach to find the .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'newsletter';

let client;
let dbInstance;

export async function getDb() {
  if (dbInstance) return dbInstance;
  
  // Verify MongoDB URI exists before attempting connection
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined. Please check your .env file.');
  }
  
  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    dbInstance = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    return dbInstance;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function closeDb() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
    client = null;
    dbInstance = null;
  }
}

// For testing the connection directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const db = await getDb();
      console.log("✅ Successfully connected to MongoDB!");
      
      const collection = db.collection('subscribers');
      console.log("✅ Successfully accessed subscribers collection");
      
      const count = await collection.countDocuments();
      console.log(`✅ Current subscriber count: ${count}`);
      
      await closeDb();
      console.log("Connection closed.");
    } catch (err) {
      console.error("❌ Failed to connect to MongoDB:", err);
    }
  })();
}