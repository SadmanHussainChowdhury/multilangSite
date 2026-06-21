import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITranslationVersion extends Document {
  locale: string;
  version: number;
  updatedAt: Date;
}

const TranslationVersionSchema = new Schema<ITranslationVersion>(
  {
    locale: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const TranslationVersion: Model<ITranslationVersion> =
  mongoose.models.TranslationVersion ||
  mongoose.model<ITranslationVersion>('TranslationVersion', TranslationVersionSchema);

export default TranslationVersion;
