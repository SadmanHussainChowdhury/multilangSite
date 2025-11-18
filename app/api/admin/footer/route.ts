import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Footer from '@/models/Footer';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const footerSchema = z.object({
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my']),
  companyName: z.string().min(1, 'Company name is required').max(255).trim(),
  companyDescription: z.string().max(500).trim().optional(),
  address: z.string().max(500).trim().optional(),
  phone: z.string().max(50).trim().optional(),
  email: z.string().email('Invalid email').max(255).trim().optional(),
  socialLinks: z.object({
    facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
    youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
  }).optional(),
  quickLinks: z.array(z.object({
    title: z.string().min(1).max(100),
    url: z.string().min(1).max(500),
  })).optional(),
  services: z.array(z.object({
    title: z.string().min(1).max(100),
    url: z.string().min(1).max(500),
  })).optional(),
  copyrightText: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch footer by locale
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const footer = await Footer.findOne({ locale, isActive: true });

    if (!footer) {
      return NextResponse.json({ message: 'Footer not found' }, { status: 404 });
    }

    return NextResponse.json({ data: footer });
  } catch (error) {
    console.error('Fetch footer error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch footer' },
      { status: 500 }
    );
  }
}

// POST - Create or update footer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Clean up empty social links
    if (body.socialLinks) {
      Object.keys(body.socialLinks).forEach((key) => {
        if (!body.socialLinks[key] || body.socialLinks[key].trim() === '') {
          delete body.socialLinks[key];
        }
      });
    }

    // Validate input
    const validatedData = footerSchema.parse(body);

    await connectDB();

    // Upsert footer (update if exists, create if not)
    const footer = await Footer.findOneAndUpdate(
      { locale: validatedData.locale },
      validatedData,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(
      { message: 'Footer saved successfully', data: footer },
      { status: 201 }
    );
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

    console.error('Save footer error:', error);
    return NextResponse.json(
      { message: 'Failed to save footer' },
      { status: 500 }
    );
  }
}

