// Full code for src/app/api/admin/subscribers/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const subscribers = await db.collection('subscribers').find({}).sort({ subscribedAt: -1 }).toArray();
    return NextResponse.json({ success: true, subscribers });
  } catch (e: any) {
    console.error("Subscribers fetch error:", e);
    return NextResponse.json({ success: false, message: 'DB error', error: e.message }, { status: 500 });
  }
}
