import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ensureAuthEnv, getAuthSecret } from './authEnv';
import connectDB from './mongodb';
import User from '@/models/User';

ensureAuthEnv();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.trim().toLowerCase() }).select('+password');

        if (!user) {
          return null;
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: getAuthSecret(),
  logger: {
    error(code, metadata) {
      console.error(`[next-auth][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[next-auth][${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[next-auth][${code}]`, metadata);
      }
    },
  },
};
