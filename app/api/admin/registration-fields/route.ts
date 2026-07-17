import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationSettings from '@/models/RegistrationSettings';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    let settings = await RegistrationSettings.findOne();
    if (!settings) {
      settings = await RegistrationSettings.create({});
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Fetch registration settings error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registration settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();

    await connectDB();

    let settings = await RegistrationSettings.findOne();
    if (!settings) {
      settings = new RegistrationSettings();
    }

    // Update settings
    settings.fields = body.fields;

    await settings.save();

    return NextResponse.json({
      message: 'Registration settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update registration settings error:', error);
    return NextResponse.json(
      { message: 'Failed to update registration settings' },
      { status: 500 }
    );
  }
}
