import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRegistration extends Document {
  name: string;
  alien_number: string;
  passport_number?: string;
  nationality: string;
  phone: string;
  visa_type: 'income_tax' | 'house_rent' | 'family_tax' | 'other';
  message?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    alien_number: {
      type: String,
      required: [true, 'Alien registration number is required'],
      trim: true,
    },
    passport_number: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    visa_type: {
      type: String,
      enum: ['income_tax', 'house_rent', 'family_tax', 'other'],
      required: [true, 'Service type is required'],
    },
    message: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Registration: Model<IRegistration> =
  mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;

