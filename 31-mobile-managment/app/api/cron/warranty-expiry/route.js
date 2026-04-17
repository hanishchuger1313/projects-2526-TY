import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * GET /api/cron/warranty-expiry
 * Marks all active warranties that have passed their expiry date as 'expired'.
 * Secure with CRON_SECRET header — set the same value in your cron provider
 * (e.g. Vercel Cron, GitHub Actions, external scheduler).
 *
 * Example vercel.json cron:
 * { "crons": [{ "path": "/api/cron/warranty-expiry", "schedule": "0 0 * * *" }] }
 */
export async function GET(request) {
  // Simple secret check — add CRON_SECRET to your .env
  const secret = request.headers.get('x-cron-secret') || new URL(request.url).searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const warranties = await getCollection('warranties');
    const now = new Date();

    const result = await warranties.updateMany(
      { status: 'active', expiryDate: { $lt: now } },
      { $set: { status: 'expired', expiredAt: now, updatedAt: now } }
    );

    console.log(`[warranty-expiry cron] Expired ${result.modifiedCount} warranties at ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      expiredCount: result.modifiedCount,
      ranAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Warranty expiry cron error:', error);
    return NextResponse.json({ error: 'Failed to process warranty expiry' }, { status: 500 });
  }
}
