import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET - Fetch active technicians for assignment
export async function GET() {
  try {
    const users = await getCollection('users');
    const technicians = await users.find({
      role: 'technician',
      status: 'active'
    }).project({ password: 0 }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      technicians: technicians.map(({ _id, ...rest }) => ({
        ...rest,
        id: _id.toString()
      }))
    });
  } catch (error) {
    console.error('Fetch technicians error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 }
    );
  }
}
