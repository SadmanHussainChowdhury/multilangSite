import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITranslation extends Document {
  key: string; // e.g., "common.home", "nav.aboutUs"
  locale: string;
  value: string;
  namespace?: string; // e.g., "common", "nav", "home"
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<ITranslation>(
  {
    key: {
      type: String,
      required: [true, 'Translation key is required'],
      trim: true,
    },
    locale: {
      type: String,
      required: [true, 'Locale is required'],
      enum: ['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my'],
    },
    value: {
      type: String,
      required: [true, 'Translation value is required'],
    },
    namespace: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique key per locale
TranslationSchema.index({ key: 1, locale: 1 }, { unique: true });

// Index for faster queries
TranslationSchema.index({ locale: 1, namespace: 1 });

const Translation: Model<ITranslation> =
  mongoose.models.Translation || mongoose.model<ITranslation>('Translation', TranslationSchema);

export default Translation;

