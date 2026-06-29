import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registrationUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  alien_number: z.string().min(1, 'Alien number is required').trim().optional(),
  passport_number: z.string().trim().optional(),
  nationality: z.string().min(1, 'Nationality is required').trim().optional(),
  phone: z.string().min(1, 'Phone is required').trim().optional(),
  visa_type: z.enum(['income_tax', 'house_rent', 'family_tax', 'other']).optional(),
  message: z.string().trim().optional(),
  country: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();
    const { id } = params;

    const registration = await Registration.findById(id);

    if (!registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ data: registration });
  } catch (error) {
    console.error('Fetch registration error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();
    const { id } = params;
    const body = await request.json();

    const validatedData = registrationUpdateSchema.parse(body);

    const registration = await Registration.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Registration updated successfully',
      data: registration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    console.error('Update registration error:', error);
    return NextResponse.json(
      { message: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();
    const { id } = params;

    const registration = await Registration.findByIdAndDelete(id);

    if (!registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { message: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}
