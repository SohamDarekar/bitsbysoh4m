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

// Load admin password and JWT secret from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || ADMIN_PASSWORD || 'supersecret';

// Warn if secrets are missing
if (!ADMIN_PASSWORD) {
  console.error("❌ ERROR: Missing ADMIN_PASSWORD environment variable. Check your .env file.");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ ERROR: Missing JWT_SECRET environment variable. Check your .env file.");
  process.exit(1);
}

// Load remaining imports only after environment is configured
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getDb, closeDb } from './db.js';
import jwt from 'jsonwebtoken';

// Import debug utilities
import { logEndpointCall, logApiError, inspectSmtpConfig } from './debug.js';

// Create explicit server object for better control
let server = null;

// Add the missing isValidEmail function
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
    'https://www.bitsbysoh4m.com', // Add www subdomain if applicable
    'http://localhost:4321'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Create separate rate limiters for public and admin routes
const publicRateLimiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute
  message: 'Too many requests, please try again later.'
});

const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 requests per minute for admin routes
  message: 'Too many admin requests, please try again later.',
  keyGenerator: (req) => {
    // Use a different key for admin routes to separate limits
    return req.headers.authorization || req.ip;
  }
});

// Apply rate limiter only to public routes
app.use(/^(?!\/api\/admin).+/, publicRateLimiter);

// Middleware to check admin JWT
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    if (!decoded.admin) throw new Error('Not admin');
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
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

// Admin login endpoint
app.post('/api/admin', adminRateLimiter, (req, res) => {
  // Debug log for incoming password
  console.log("Admin login attempt. Received password:", req.body.password ? '[provided]' : '[missing]');
  // Debug log for loaded ADMIN_PASSWORD
  console.log("Loaded ADMIN_PASSWORD:", ADMIN_PASSWORD ? '[set]' : '[missing]');
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    console.log("Admin login failed: invalid password");
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '2h' });
  console.log("Admin login successful, token issued");
  res.json({ success: true, token });
});

// Admin: test API
app.get('/api/admin/test-api', adminRateLimiter, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Admin: test DB
app.get('/api/admin/test-db', adminRateLimiter, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const count = await db.collection('subscribers').countDocuments();
    res.json({ success: true, message: 'DB is working', subscriberCount: count });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error', error: e.message });
  }
});

// Admin: send newsletter
app.post('/api/admin/send-newsletter', adminRateLimiter, requireAdmin, async (req, res) => {
  const { subject, html, scheduled, segment } = req.body;
  if (!subject || !html) return res.status(400).json({ success: false, message: 'Missing subject or html' });
  
  try {
    const db = await getDb();
    
    // Handle segmentation if specified
    let query = { unsubscribed: { $ne: true } };
    if (segment === 'active') {
      // Only active subscribers who have opened emails in the last 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      query.lastOpenedAt = { $gte: sixtyDaysAgo };
    } else if (segment === 'recent') {
      // Only subscribers from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.subscribedAt = { $gte: thirtyDaysAgo };
    }
    
    const subscribers = await db.collection('subscribers').find(query).toArray();
    
    // If there are no subscribers, return early
    if (subscribers.length === 0) {
      return res.json({ success: true, sent: 0, failed: 0, total: 0, message: 'No matching subscribers found' });
    }
    
    // If this is a scheduled newsletter, save it to database and return
    if (scheduled) {
      await db.collection('scheduledNewsletters').insertOne({
        subject,
        html,
        scheduledFor: new Date(scheduled),
        segment,
        createdAt: new Date(),
      });
      return res.json({ 
        success: true, 
        scheduled: true, 
        scheduledFor: scheduled,
        recipientCount: subscribers.length
      });
    }
    
    // Otherwise, send the newsletter now
    const nodemailer = (await import('nodemailer')).default;
    
    // Create transporter with proper error handling
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE === 'true'),
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      tls: {
        rejectUnauthorized: false // Useful in development
      }
    });
    
    // Verify SMTP connection
    await transporter.verify().catch(error => {
      console.error("SMTP Verification Error:", error);
      throw new Error(`SMTP connection failed: ${error.message}`);
    });
    
    let sent = 0, failed = 0;
    const websiteUrl = process.env.WEBSITE_URL || 'https://bitsbysoh4m.netlify.app/';
    const fromName = process.env.SMTP_FROM_NAME || 'Bits by Soham';
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    for (const sub of subscribers) {
      const unsubscribeUrl = `${websiteUrl}api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: sub.email,
          subject,
          html: `${html}
                <br><br>
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                  <p>You're receiving this email because you subscribed to Bits by Soham.</p>
                  <p><a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> if you no longer wish to receive these emails.</p>
                </div>`,
        });
        
        // Update last sent date for this subscriber
        await db.collection('subscribers').updateOne(
          { email: sub.email },
          { $set: { lastEmailSentAt: new Date() } }
        );
        
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${sub.email}:`, error);
        failed++;
      }
    }
    
    // Log the newsletter for records
    await db.collection('sentNewsletters').insertOne({
      subject,
      html,
      sentAt: new Date(),
      sent,
      failed,
      total: subscribers.length
    });
    
    res.json({ success: true, sent, failed, total: subscribers.length });
  } catch (e) {
    console.error("Newsletter send error:", e);
    res.status(500).json({ success: false, message: `Send failed: ${e.message}`, error: e.message });
  }
});

// Admin: get all subscribers (for admin panel)
app.get('/api/admin/subscribers', adminRateLimiter, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const subscribers = await db.collection('subscribers').find({}).sort({ subscribedAt: -1 }).toArray();
    res.json({ success: true, subscribers });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error', error: e.message });
  }
});

export default app;
