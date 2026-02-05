/* eslint-disable no-console */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const getArg = (key, fallback) => {
  const idx = args.findIndex((arg) => arg === `--${key}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return fallback;
};

const email = getArg('email');
const password = getArg('password');
const name = getArg('name', 'Admin');

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js --email <email> --password <password> [--name <name>]');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });

    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email }).select('+password');

    if (existing) {
      existing.name = name;
      existing.password = hashed;
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated admin user: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password: hashed,
        role: 'admin',
      });
      console.log(`Created admin user: ${email}`);
    }
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
