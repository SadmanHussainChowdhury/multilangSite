import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFieldSettings {
  id: string;
  name: string;
  isActive: boolean;
  isRequired: boolean;
  isCustom: boolean;
}

export interface IRegistrationSettings extends Document {
  fields: IFieldSettings[];
}

const FieldSettingsSchema = new Schema<IFieldSettings>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
  },
  { _id: false }
);

const RegistrationSettingsSchema = new Schema<IRegistrationSettings>(
  {
    fields: {
      type: [FieldSettingsSchema],
      default: () => [
        { id: 'name', name: 'Full Name', isActive: true, isRequired: true, isCustom: false },
        { id: 'alien_number', name: 'Alien Number', isActive: true, isRequired: true, isCustom: false },
        { id: 'passport_number', name: 'Passport Number', isActive: true, isRequired: false, isCustom: false },
        { id: 'nationality', name: 'Nationality', isActive: true, isRequired: true, isCustom: false },
        { id: 'phone', name: 'Phone', isActive: true, isRequired: true, isCustom: false },
        { id: 'visa_type', name: 'Service Type', isActive: true, isRequired: true, isCustom: false },
        { id: 'message', name: 'Additional Information', isActive: true, isRequired: false, isCustom: false },
        { id: 'country', name: 'Country', isActive: true, isRequired: false, isCustom: false },
      ]
    },
  },
  {
    timestamps: true,
  }
);

const RegistrationSettings: Model<IRegistrationSettings> =
  mongoose.models.RegistrationSettings || mongoose.model<IRegistrationSettings>('RegistrationSettings', RegistrationSettingsSchema);

export default RegistrationSettings;
