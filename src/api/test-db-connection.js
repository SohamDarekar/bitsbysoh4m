import { getDb, closeDb } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    // Log environment variables for debugging (redacting sensitive parts)
    console.log('Environment variables:');
    
    // Check if MONGODB_URI is set and valid
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('❌ MONGODB_URI is not set!');
      return;
    }
    
    // Print masked URI to avoid showing credentials in logs
    const maskedUri = maskConnectionString(mongoUri);
    console.log(`MONGODB_URI: ${maskedUri}`);
    console.log(`MONGODB_DB_NAME: ${process.env.MONGODB_DB_NAME || '(not set, using default)'}`);
    
    console.log('\nTesting MongoDB connection...');
    const db = await getDb();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test getting the subscribers collection
    const subscribersCollection = db.collection('subscribers');
    console.log('✅ Successfully accessed subscribers collection');
    
    // Count subscribers
    const count = await subscribersCollection.countDocuments();
    console.log(`✅ Current subscriber count: ${count}`);
    
    // Close the connection
    await closeDb();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    
    if (error.message.includes('auth')) {
      console.log('\n🔑 Authentication Troubleshooting:');
      console.log('1. Check that your username and password are correct in MONGODB_URI');
      console.log('2. Verify that the user has the necessary permissions for the database');
      console.log('3. Make sure special characters in the password are URL-encoded');
    }
  }
}

// Function to mask sensitive parts of the connection string
function maskConnectionString(uri) {
  try {
    if (!uri) return '(not set)';
    
    const url = new URL(uri);
    let protocol = url.protocol;
    let auth = '***:***';
    let host = url.hostname;
    let port = url.port ? `:${url.port}` : '';
    let path = url.pathname;
    let query = url.search ? '?***' : '';
    
    return `${protocol}//${auth}@${host}${port}${path}${query}`;
  } catch (e) {
    return '(invalid URI format)';
  }
}

testConnection();
