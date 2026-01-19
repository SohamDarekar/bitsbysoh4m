// Full code for src/app/api/admin/subscribers/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Subscriber ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('subscribers').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (e: any) {
    console.error("Subscriber deletion error:", e);
    return NextResponse.json({ success: false, message: 'DB error', error: e.message }, { status: 500 });
  }
}
