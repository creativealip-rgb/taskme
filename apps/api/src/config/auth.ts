import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database.js";
import * as dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache in cookie
    },
  },
  advanced: {
    cookiePrefix: "task_manager",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      httpOnly: true,
      path: "/",
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL!,
    "http://localhost:5173",
    "http://localhost:3000",
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
