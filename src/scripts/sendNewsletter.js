import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import readline from 'readline';
import { getDb, closeDb } from '../api/db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Correctly resolve the path to the .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

// Load environment variables
dotenv.config({ path: envPath });

// Verify that the .env file exists
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env file not found at ${envPath}`);
  console.log('Please create a .env file with your MongoDB connection string (MONGODB_URI) and other required environment variables.');
  process.exit(1);
}

async function main() {
  try {
    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined. Please check your .env file.');
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('One or more SMTP environment variables are missing. Please check your .env file.');
    }
    
    console.log('Connecting to database...');
    const db = await getDb();
    console.log('Successfully connected to database');
    
    const subscribers = await db.collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .toArray();
    
    console.log(`Found ${subscribers.length} active subscribers`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((res) => rl.question(q, res));
    const subject = await ask("Subject: ");
    const html = await ask("HTML content: ");
    rl.close();

    for (const sub of subscribers) {
      const unsubscribeUrl = `${process.env.WEBSITE_URL}api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
        to: sub.email,
        subject,
        html: `${html}<br><br><a href="${unsubscribeUrl}">Unsubscribe</a>`,
      });
      console.log(`Sent to ${sub.email}`);
    }
    
    await closeDb();
    console.log('Newsletter sending completed');
  } catch (error) {
    console.error('Error sending newsletter:', error);
    process.exit(1);
  }
}

main();