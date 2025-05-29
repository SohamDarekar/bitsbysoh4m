import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getDb } from './db.js';

dotenv.config();

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
app.use(rateLimit({ windowMs: 60 * 1000, max: 5 }));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Add a test endpoint to verify the API is running
app.get('/api/health', (req, res) => {
  console.log("🔍 Health check endpoint called");
  res.json({ status: 'ok', message: 'Newsletter API is running' });
});

// Add a test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
  console.log("🔍 Test DB connection endpoint called");
  try {
    const db = await getDb();
    const collection = db.collection('subscribers');
    const count = await collection.countDocuments();
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful', 
      subscriberCount: count
    });
  } catch (error) {
    console.error("❌ Database test failed:", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to database',
      error: error.message
    });
  }
});

app.post('/api/subscribe', async (req, res) => {
  console.log("🔔 POST /api/subscribe called with body:", req.body);
  
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    console.log("❌ Invalid email:", email);
    return res.status(400).json({ success: false, message: 'Invalid email.' });
  }
  
  try {
    console.log("📊 Connecting to MongoDB...");
    const db = await getDb();
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`📧 Newsletter API running on port ${PORT}`));