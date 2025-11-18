import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILogo extends Document {
  name: string;
  imageUrl: string;
  altText?: string;
  locale?: string; // Optional: for locale-specific logos
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LogoSchema = new Schema<ILogo>(
  {
    name: {
      type: String,
      required: [true, 'Logo name is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Logo image URL is required'],
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
    },
    locale: {
      type: String,
      enum: ['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my'],
      default: 'en', // Default logo for all locales
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

// Index for faster queries
LogoSchema.index({ locale: 1, isActive: 1 });

const Logo: Model<ILogo> = mongoose.models.Logo || mongoose.model<ILogo>('Logo', LogoSchema);

export default Logo;

