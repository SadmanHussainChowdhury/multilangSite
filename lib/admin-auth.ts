import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from './authEnv';

export async function requireAdmin(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
