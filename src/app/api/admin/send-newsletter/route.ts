// Full code for src/app/api/admin/send-newsletter/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { subject, html, scheduled, segment } = await request.json();
    
    if (!subject || !html) {
      return NextResponse.json({ success: false, message: 'Missing subject or html' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Handle segmentation if specified
    let query: any = { unsubscribed: { $ne: true } };
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
      return NextResponse.json({ success: true, sent: 0, failed: 0, total: 0, message: 'No matching subscribers found' });
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
      return NextResponse.json({ 
        success: true, 
        scheduled: true, 
        scheduledFor: scheduled,
        recipientCount: subscribers.length
      });
    }
    
    // Otherwise, send the newsletter now
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
    try {
      await transporter.verify();
    } catch (error: any) {
      console.error("SMTP Verification Error:", error);
      return NextResponse.json({ success: false, message: `SMTP connection failed: ${error.message}` }, { status: 500 });
    }
    
    let sent = 0, failed = 0;
    const websiteUrl = process.env.WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://bitsbysoh4m.com';
    const fromName = process.env.SMTP_FROM_NAME || 'Bits by Soham';
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    for (const sub of subscribers) {
      const unsubscribeUrl = `${websiteUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
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
      } catch (error: any) {
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
    
    return NextResponse.json({ success: true, sent, failed, total: subscribers.length });
  } catch (e: any) {
    console.error("Newsletter send error:", e);
    return NextResponse.json({ success: false, message: `Send failed: ${e.message}`, error: e.message }, { status: 500 });
  }
}
