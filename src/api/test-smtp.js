#!/usr/bin/env node
/**
 * SMTP Configuration Tester
 * Tests the SMTP configuration for sending emails
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';

// Setup proper paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from multiple locations
console.log("Checking for .env files...");
const envPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../../.env')
];

envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    console.log(`Found .env at ${envPath}`);
    dotenv.config({ path: envPath });
  }
});

if (!process.env.SMTP_HOST) {
  console.log("No SMTP configuration found in .env files");
  console.log("Running in interactive mode...");
}

// Create readline interface for interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions interactively
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function testSmtp() {
  try {
    console.log("\n=== SMTP Configuration Test ===");
    
    // Check required SMTP settings
    let smtpHost = process.env.SMTP_HOST;
    let smtpPort = process.env.SMTP_PORT;
    let smtpUser = process.env.SMTP_USER;
    let smtpPass = process.env.SMTP_PASS;
    let smtpSecure = process.env.SMTP_SECURE === 'true';
    let testEmail;
    
    // If any are missing, ask interactively
    if (!smtpHost) {
      smtpHost = await question("SMTP Host (e.g. smtp.gmail.com): ");
    }
    
    if (!smtpPort) {
      smtpPort = await question(`SMTP Port (e.g. 587 for TLS, 465 for SSL): `);
    }
    
    if (!smtpUser) {
      smtpUser = await question("SMTP Username (usually your email): ");
    }
    
    if (!smtpPass) {
      smtpPass = await question("SMTP Password (for app passwords, see instructions): ");
    }
    
    testEmail = await question("Send test email to (your email to receive test): ");
    
    console.log("\nTesting SMTP configuration...");
    console.log(`Host: ${smtpHost}`);
    console.log(`Port: ${smtpPort}`);
    console.log(`User: ${smtpUser}`);
    console.log(`Secure: ${smtpSecure}`);
    console.log(`Sending to: ${testEmail}\n`);
    
    // Import nodemailer
    const nodemailer = (await import('nodemailer')).default;
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false // Helps in development environments
      }
    });
    
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");
    
    console.log("\nSending test email...");
    const info = await transporter.sendMail({
      from: `"SMTP Test" <${smtpUser}>`,
      to: testEmail,
      subject: "SMTP Test Email",
      text: "If you're reading this, your SMTP configuration is working correctly!",
      html: `
        <h1>SMTP Test Successful</h1>
        <p>If you're reading this, your SMTP configuration is working correctly!</p>
        <p>Here are your settings:</p>
        <ul>
          <li><strong>Host:</strong> ${smtpHost}</li>
          <li><strong>Port:</strong> ${smtpPort}</li>
          <li><strong>User:</strong> ${smtpUser}</li>
          <li><strong>Secure:</strong> ${smtpSecure}</li>
        </ul>
        <p>You can use these in your .env file:</p>
        <pre>
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_USER=${smtpUser}
SMTP_PASS=****
SMTP_SECURE=${smtpSecure}
SMTP_FROM=${smtpUser}
SMTP_FROM_NAME=Bits by Soham
        </pre>
      `
    });
    
    console.log("✅ Test email sent successfully!");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log("\nCheck your inbox to confirm the email was received.");
    
    console.log(`\nUse these settings in your .env file:

SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_USER=${smtpUser}
SMTP_PASS=****
SMTP_SECURE=${smtpSecure}
SMTP_FROM=${smtpUser}
SMTP_FROM_NAME=Bits by Soham
    `);
    
  } catch (error) {
    console.error("❌ SMTP Test Failed:", error.message);
    
    if (error.message.includes('535')) {
      console.log("\n🔐 Authentication Error:");
      console.log("1. If using Gmail, make sure to create an App Password:");
      console.log("   - Go to https://myaccount.google.com/apppasswords");
      console.log("   - Create a new app password for 'Mail'");
      console.log("   - Use that password instead of your regular account password");
      console.log("2. Check that your username and password are correct");
      console.log("3. Make sure your email provider allows SMTP access");
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log("\n🔌 Connection Error:");
      console.log("1. Check that your SMTP host and port are correct");
      console.log("2. Make sure there's no firewall blocking the connection");
      console.log("3. Try using a different port (587, 465, or 25)");
    }
    
  } finally {
    rl.close();
  }
}

testSmtp();
