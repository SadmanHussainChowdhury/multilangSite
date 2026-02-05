import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const now = new Date();
    
    // Today start (00:00:00)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // Week start (7 days ago)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    
    // Month start (30 days ago)
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [total, today, thisWeek, thisMonth] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ createdAt: { $gte: todayStart } }),
      Registration.countDocuments({ createdAt: { $gte: weekStart } }),
      Registration.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    return NextResponse.json({
      totalRegistrations: total,
      todayRegistrations: today,
      thisWeekRegistrations: thisWeek,
      thisMonthRegistrations: thisMonth,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

