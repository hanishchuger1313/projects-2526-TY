import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/models';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Your account is pending approval. Please wait for admin verification.',
          status: user.status
        },
        { status: 403 }
      );
    }

    // Return user without password
    const { password: _, _id, ...userWithoutPassword } = user;

    // Determine redirect path based on role
    const redirectPaths = {
      admin: '/admin',
      shop: '/shop',
      service: '/service',
      customer: '/customer',
      technician: '/technician'
    };

    return NextResponse.json(
      {
        message: 'Login successful',
        user: { ...userWithoutPassword, id: _id.toString() },
        redirectTo: redirectPaths[user.role]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
