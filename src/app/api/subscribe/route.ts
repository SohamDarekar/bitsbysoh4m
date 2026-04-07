import { NextResponse, NextRequest } from 'next/server';
import { AlreadyRegisteredError, subscribeMember } from '@/lib/ghost';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email.' }, { status: 400 });
    }

    await subscribeMember(email);

    return NextResponse.json({ success: true, message: 'Subscribed!' });
  } catch (e: any) {
    if (e instanceof AlreadyRegisteredError) {
      return NextResponse.json({
        success: true,
        message: 'Looks like this email is already registered.',
      });
    }

    console.error('Subscription error:', e);
    return NextResponse.json({ success: false, message: 'Server error. Please try again later.' }, { status: 500 });
  }
}
