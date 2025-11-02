// Full code for src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
// Remove backslashes that Next.js adds when escaping $ in .env files
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: Request) {
  if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
     console.error("Auth environment variables are not set.");
     return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
  }
  
  try {
    const { password } = await request.json();
    
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '2h' });
    
    const response = NextResponse.json({ success: true, token });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    });
    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
