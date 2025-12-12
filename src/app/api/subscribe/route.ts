// Full code for src/app/api/subscribe/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const normalized = email.trim().toLowerCase();
    
    const existing = await db.collection('subscribers').findOne({ email: normalized });
    if (existing && !existing.unsubscribed) {
      return NextResponse.json({ success: false, message: 'Already subscribed.' }, { status: 409 });
    }

    const result = await db.collection('subscribers').updateOne(
      { email: normalized },
      { 
        $set: { 
          email: normalized, 
          subscribedAt: new Date(), 
          unsubscribed: false,
          source: request.headers.get('referer') || 'unknown'
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Subscribed!', result });
  } catch (e: any) {
    console.error("Subscription error:", e);
    
    // Provide user-friendly error message for connection issues
    if (e.code === 'ENOTFOUND' || e.message?.includes('ENOTFOUND')) {
      return NextResponse.json(
        { success: false, message: 'Newsletter service temporarily unavailable. Please try again later.' }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json({ success: false, message: 'Server error. Please try again later.' }, { status: 500 });
  }
}
