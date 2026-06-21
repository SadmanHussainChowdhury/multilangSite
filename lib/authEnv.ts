function hashString(input: string) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (isProduction()) {
    throw new Error('Missing NEXTAUTH_SECRET or AUTH_SECRET environment variable.');
  }

  const source = process.env.MONGODB_URI || process.env.VERCEL_URL || 'local-dev-secret';
  return Array.from({ length: 8 }, (_, index) => hashString(`${source}:${index}`)).join('');
}

export function getNextAuthUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function ensureAuthEnv() {
  if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = getAuthSecret();
  }

  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = getNextAuthUrl();
  }
}
