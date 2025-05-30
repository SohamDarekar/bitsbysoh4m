import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

dotenv.config();

const app = express();
// Update CORS configuration to allow requests from all your domains
app.use(cors({
  origin: [
    'https://bitsbysoh4m.netlify.app',
    'http://localhost:3000',
    'https://bitsbysoh4m.com',
    'https://www.bitsbysoh4m.com',
    'http://localhost:4321'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add a health check endpoint to verify the API is running
app.get('/api/health', (req, res) => {
  console.log("🔍 Unsubscribe API health check endpoint called");
  res.json({ status: 'ok', message: 'Unsubscribe API is running' });
});

app.get('/api/unsubscribe', async (req, res) => {
  console.log("🔔 GET /api/unsubscribe called with email:", req.query.email);
  
  const email = (req.query.email || '').toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log("❌ Invalid email:", email);
    return res.status(400).send('Invalid email.');
  }
  
  try {
    console.log("📊 Connecting to MongoDB...");
    const db = await getDb();
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
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`
    ======================================================
    📧 Unsubscribe API running on port ${PORT}
    ======================================================
    
    Available endpoints:
    - GET /api/health - Check if API is running
    - GET /api/unsubscribe?email=user@example.com - Unsubscribe a user
    
    Test with:
    curl http://localhost:${PORT}/api/health
    curl http://localhost:${PORT}/api/unsubscribe?email=test@example.com
    `);
  });
}
export default app;