import mongoose, { Document, Model, Schema, Query } from 'mongoose';

export interface IPage extends Document {
  title: string;
  content: string;
  slug: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Query interface for custom query methods
interface IPageQuery extends Query<any, IPage> {
  notDeleted(): IPageQuery;
}

const PageSchema = new Schema<IPage>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
    },
    locale: {
      type: String,
      required: [true, 'Locale is required'],
      enum: ['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my'],
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique slug per locale
PageSchema.index({ slug: 1, locale: 1 }, { unique: true });

// Soft delete query helper
(PageSchema.query as any).notDeleted = function (this: IPageQuery) {
  return this.where({ deletedAt: null });
};

const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);

export default Page;

