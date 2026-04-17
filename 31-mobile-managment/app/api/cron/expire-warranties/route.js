import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET - Called by cron scheduler (e.g. Vercel Cron, external cron)
// Schedule: daily at midnight  →  vercel.json: "0 0 * * *"
export async function GET(request) {
  try {
    // Optional: protect with a secret header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const warranties = await getCollection('warranties');
    const now = new Date();

    // Find all active warranties whose expiryDate has passed
    const expired = await warranties.find({
      status: 'active',
      expiryDate: { $lt: now },
    }).toArray();

    if (expired.length === 0) {
      return NextResponse.json({ success: true, message: 'No warranties to expire', count: 0 });
    }

    const expiredIds = expired.map(w => w._id);

    const result = await warranties.updateMany(
      { _id: { $in: expiredIds } },
      {
        $set: {
          status: 'expired',
          expiredAt: now,
          updatedAt: now,
        },
      }
    );

    console.log(`[CRON] Expired ${result.modifiedCount} warranties`);

    return NextResponse.json({
      success: true,
      message: `Expired ${result.modifiedCount} warranties`,
      count: result.modifiedCount,
      expiredWarrantyIds: expiredIds.map(id => id.toString()),
    });
  } catch (error) {
    console.error('[CRON] Warranty expiry error:', error);
    return NextResponse.json({ error: 'Failed to run warranty expiry job' }, { status: 500 });
  }
}
