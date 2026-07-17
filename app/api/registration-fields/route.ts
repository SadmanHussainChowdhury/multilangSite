import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationSettings from '@/models/RegistrationSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    let settings = await RegistrationSettings.findOne();
    if (!settings) {
      // Return default configuration if none exists yet
      settings = {
        fields: [
          { id: 'name', name: 'Full Name', isActive: true, isRequired: true, isCustom: false },
          { id: 'alien_number', name: 'Alien Number', isActive: true, isRequired: true, isCustom: false },
          { id: 'passport_number', name: 'Passport Number', isActive: true, isRequired: false, isCustom: false },
          { id: 'nationality', name: 'Nationality', isActive: true, isRequired: true, isCustom: false },
          { id: 'phone', name: 'Phone', isActive: true, isRequired: true, isCustom: false },
          { id: 'visa_type', name: 'Service Type', isActive: true, isRequired: true, isCustom: false },
          { id: 'message', name: 'Additional Information', isActive: true, isRequired: false, isCustom: false },
          { id: 'country', name: 'Country', isActive: true, isRequired: false, isCustom: false },
        ]
      } as any;
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
