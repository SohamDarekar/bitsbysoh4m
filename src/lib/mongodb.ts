// Full code for src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'newsletter';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface CachedMongoConnection {
  client: MongoClient | null;
  db: Db | null;
}

let cached: CachedMongoConnection = {
  client: null,
  db: null,
};

export async function connectToDatabase() {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(dbName);

  cached.client = client;
  cached.db = db;

  return { client, db };
}
