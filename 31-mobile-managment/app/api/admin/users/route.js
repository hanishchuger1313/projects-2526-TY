import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch all users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    const filters = {};
    if (status) filters.status = status;
    if (role) filters.role = role;

    const users = await UserModel.findAll(filters);

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, _id, ...user }) => ({
      ...user,
      id: _id.toString()
    }));

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PATCH - Update user status (approve/reject/block)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, status, action } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await UserModel.update(userId, { status });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { password, _id, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: `User ${action || 'updated'} successfully`,
      user: { ...userWithoutPassword, id: _id.toString() }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin before deleting
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 403 }
      );
    }

    await UserModel.delete(userId);

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
