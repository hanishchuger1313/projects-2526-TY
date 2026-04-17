import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/models';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, shopName, centerName, address, licenseNumber } = body;

    // Validation
    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Role-specific validation
    if (role === 'shop' && !shopName) {
      return NextResponse.json(
        { error: 'Shop name is required for shop owners' },
        { status: 400 }
      );
    }

    if (role === 'service' && (!centerName || !licenseNumber)) {
      return NextResponse.json(
        { error: 'Center name and license number are required for service centers' },
        { status: 400 }
      );
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      status: role === 'customer' || role === 'technician' ? 'active' : 'pending',
      shopName: role === 'shop' ? shopName : undefined,
      centerName: role === 'service' ? centerName : undefined,
      address: address || undefined,
      licenseNumber: role === 'service' ? licenseNumber : undefined,
    };

    const newUser = await UserModel.create(userData);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: role === 'customer' || role === 'technician' 
          ? 'Account created successfully' 
          : 'Registration submitted. Awaiting admin approval.',
        user: { ...userWithoutPassword, id: newUser._id.toString() },
        requiresApproval: role === 'shop' || role === 'service'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all users (admin only)
export async function GET(request) {
  try {
    const users = await UserModel.findAll();
    const usersWithoutPasswords = users.map(({ password, _id, ...user }) => ({
      ...user,
      id: _id.toString()
    }));
    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
