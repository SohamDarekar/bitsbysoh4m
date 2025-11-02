// Full code for src/app/api/admin/test-db/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const count = await db.collection('subscribers').countDocuments();
    return NextResponse.json({ success: true, message: 'DB is working', subscriberCount: count });
  } catch (e: any) {
    console.error("DB test error:", e);
    return NextResponse.json({ success: false, message: 'DB error', error: e.message }, { status: 500 });
  }
}
