import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const shopId = searchParams.get('shopId');

    const users = await getCollection('users');
    const query = { status: 'active' };
    if (role) query.role = role;

    const allUsers = await users.find(query).sort({ name: 1 }).toArray();

    const mapped = allUsers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: mapped });
  } catch (error) {
    console.error('Shop customers GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
