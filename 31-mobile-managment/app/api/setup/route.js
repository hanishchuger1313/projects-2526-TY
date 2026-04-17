import { NextResponse } from 'next/server';
import { initializeDatabase, seedDemoData } from '@/lib/db-init';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'init') {
      // Initialize database with indexes and admin user
      await initializeDatabase();
      return NextResponse.json({ 
        message: 'Database initialized successfully',
        success: true 
      });
    }

    if (action === 'seed') {
      // Seed demo data
      await seedDemoData();
      return NextResponse.json({ 
        message: 'Demo data seeded successfully',
        success: true 
      });
    }

    return NextResponse.json({
      message: 'Database setup endpoint',
      actions: [
        { action: 'init', description: 'Initialize database with indexes and admin user' },
        { action: 'seed', description: 'Seed demo data for testing' }
      ]
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}
