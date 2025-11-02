// Full code for src/app/api/unsubscribe/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return new Response('Invalid email.', { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection('subscribers').updateOne(
      { email },
      { $set: { unsubscribed: true, unsubscribedAt: new Date() } }
    );
    return new Response('You have been successfully unsubscribed.', { status: 200 });
  } catch (e: any) {
    console.error("Unsubscribe error:", e);
    return new Response('Server error. Please try again later.', { status: 500 });
  }
}
