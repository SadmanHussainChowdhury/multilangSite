import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFooter extends Document {
  locale: string;
  companyName: string;
  companyDescription?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  quickLinks?: Array<{
    title: string;
    url: string;
  }>;
  services?: Array<{
    title: string;
    url: string;
  }>;
  copyrightText?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FooterSchema = new Schema<IFooter>(
  {
    locale: {
      type: String,
      required: [true, 'Locale is required'],
      enum: ['vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String,
    },
    quickLinks: [
      {
        title: String,
        url: String,
      },
    ],
    services: [
      {
        title: String,
        url: String,
      },
    ],
    copyrightText: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique footer per locale
FooterSchema.index({ locale: 1 }, { unique: true });

const Footer: Model<IFooter> =
  mongoose.models.Footer || mongoose.model<IFooter>('Footer', FooterSchema);

export default Footer;

