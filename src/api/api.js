// First load all environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup proper paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log the current directory and potential .env locations
console.log("Current directory:", __dirname);
console.log("Project root:", path.resolve(__dirname, '../../'));
console.log("Checking for .env files...");

// Check for .env files in different locations
const envPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../../.env')
];

envPaths.forEach(envPath => {
  console.log(`Checking ${envPath}: ${fs.existsSync(envPath) ? 'exists' : 'not found'}`);
});

// Try to load .env from the API directory first, then fallback to project root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log environment variables (redacted for security)
console.log("Environment loaded:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing");
console.log("PORT:", process.env.PORT || "4000 (default)");

// Load remaining imports only after environment is configured
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getDb, closeDb } from './db.js';

// Create explicit server object for better control
let server = null;

// Verify MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error("❌ ERROR: Missing MONGODB_URI environment variable. Check your .env file.");
  process.exit(1);  // Exit if critical config is missing
}

const app = express();
app.use(express.json());
// Update CORS configuration to allow requests from all your domains
app.use(cors({
  origin: [
    'https://bitsbysoh4m.netlify.app', 
    'http://localhost:3000',
    'https://bitsbysoh4m.com', // Add your main domain if different
    'https://www.bitsbysoh4m.com' // Add www subdomain if applicable
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(rateLimit({ windowMs: 60 * 1000, max: 10 }));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log("🔍 API health check endpoint called");
  res.json({ status: 'ok', message: 'Newsletter API is running' });
});

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
  console.log("🔔 POST /api/subscribe called with body:", req.body);
  
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    console.log("❌ Invalid email:", email);
    return res.status(400).json({ success: false, message: 'Invalid email.' });
  }
  
  try {
    console.log("📊 Connecting to MongoDB...");
    const db = await Promise.race([
      getDb(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 5000ms')), 5000)
      )
    ]);
    console.log("✅ Connected to MongoDB successfully");
    
    const sub = db.collection('subscribers');
    const normalized = email.trim().toLowerCase();
    console.log("🔍 Checking if email already exists:", normalized);
    
    const existing = await sub.findOne({ email: normalized });
    if (existing && !existing.unsubscribed) {
      console.log("⚠️ Email already subscribed");
      return res.status(409).json({ success: false, message: 'Already subscribed.' });
    }
    
    console.log("📝 Subscribing email:", normalized);
    const result = await sub.updateOne(
      { email: normalized },
      { 
        $set: { 
          email: normalized, 
          subscribedAt: new Date(), 
          unsubscribed: false,
          source: req.headers.referer || 'unknown'
        }
      },
      { upsert: true }
    );
    
    console.log("✅ Subscription result:", JSON.stringify(result, null, 2));
    return res.json({ success: true, message: 'Subscribed!', result });
  } catch (e) {
    console.error("❌ Server error:", e);
    return res.status(500).json({ success: false, message: 'Server error.', error: e.message });
  }
});

// Unsubscribe endpoint
app.get('/api/unsubscribe', async (req, res) => {
  console.log("🔔 GET /api/unsubscribe called with email:", req.query.email);
  
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email || !isValidEmail(email)) {
    console.log("❌ Invalid email:", email);
    return res.status(400).send('Invalid email.');
  }
  
  try {
    console.log("📊 Connecting to MongoDB...");
    const db = await Promise.race([
      getDb(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 5000ms')), 5000)
      )
    ]);
    console.log("✅ Connected to MongoDB successfully");
    
    const sub = db.collection('subscribers');
    console.log("🔍 Looking for subscriber with email:", email);
    
    const result = await sub.updateOne(
      { email },
      { $set: { unsubscribed: true, unsubscribedAt: new Date() } }
    );
    
    console.log("✅ Unsubscribe operation result:", JSON.stringify(result, null, 2));
    
    if (result.matchedCount === 0) {
      console.log("⚠️ Email not found in database:", email);
      return res.send('Email not found, but if you were subscribed, you are now unsubscribed.');
    }
    
    res.send('You have been successfully unsubscribed from our newsletter.');
  } catch (e) {
    console.error("❌ Server error:", e);
    res.status(500).send('Server error. Please try again later.');
  }
});

const PORT = process.env.PORT || 4000;

// Immediately invoke this function expression to start the server
(async function() {
  console.log("Starting API server...");
  
  try {
    // Create a hard reference to the server to prevent garbage collection
    server = app.listen(PORT);
    
    server.once('listening', async () => {
      const now = new Date().toISOString();
      console.log(`
╭─────────────────────────────────────────────────────────╮
│                                                         │
│  🚀 NEWSLETTER API STARTED                              │
│  📅 ${now}                                 │
│  🔌 Running on port ${PORT}                                │
│  🌐 Configured for: https://bitsbysoh4m.netlify.app     │
│                                                         │
╰─────────────────────────────────────────────────────────╯

🔍 Available endpoints:
  • GET  /api/health - Check if API is running
  • POST /api/subscribe - Subscribe a user
  • GET  /api/unsubscribe?email=user@example.com - Unsubscribe a user

💡 Test commands:
  $ curl http://localhost:${PORT}/api/health
  $ curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com"}' http://localhost:${PORT}/api/subscribe
  $ curl http://localhost:${PORT}/api/unsubscribe?email=test@example.com

📱 Want a GUI? Try Thunder Client in VS Code or Postman to test API endpoints
`);
      
      // Test database connection after server is started
      console.log("📊 Testing database connection...");
      try {
        const db = await Promise.race([
          getDb(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout after 10000ms')), 10000)
          )
        ]);
        console.log("✅ Database connection confirmed on startup");
        console.log("✅ Ready to receive requests!");
      } catch (err) {
        console.error(`❌ WARNING: Database connection failed: ${err.message}`);
        console.error("The API is running but will not work correctly without database access.");
        console.error("Check your MongoDB connection string and make sure MongoDB is running.");
      }
      
      console.log("✅ API server running at http://localhost:" + PORT);
    });
    
    server.on('error', (error) => {
      console.error(`❌ SERVER ERROR: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Is another instance of the API running?`);
        console.error(`Try using a different port: PORT=5000 npm run api`);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    process.exit(1);
  }
})();

// Setup graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  if (server) {
    server.close();
    console.log('HTTP server closed.');
  }
  await closeDb();
  console.log('Database connections closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nGracefully shutting down from SIGTERM...');
  if (server) {
    server.close();
    console.log('HTTP server closed.');
  }
  await closeDb();
  console.log('Database connections closed.');
  process.exit(0);
});

// The definitive way to keep Node.js running
setInterval(() => {}, 1000 * 60 * 60);

export default app;
