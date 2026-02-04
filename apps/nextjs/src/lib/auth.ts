import { betterAuth } from 'better-auth';
import { DrizzleAdapter } from '@auth/libsql-adapter';
import { db } from '@/db';

export const auth = betterAuth({
  database: DrizzleAdapter(db, {
    provider: 'sqlite',
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  pages: {
    signIn: '/',
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  plugins: [],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
