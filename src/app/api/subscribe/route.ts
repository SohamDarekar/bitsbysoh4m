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
    return NextResponse.json({ success: false, message: 'Server error.', error: e.message }, { status: 500 });
  }
}
