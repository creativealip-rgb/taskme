import * as dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const auth = {
  api: {
    getSession: async (request: any) => {
      return {
        session: {
          id: 'session-1',
          userId: 'user-1',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        user: {
          id: 'user-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          emailVerified: true,
        },
      };
    },
  },
  $Infer: {
    Session: {
      session: {
        id: 'session-1',
        userId: 'user-1',
      },
      user: {
        id: 'user-1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
      },
    },
  },
};

export type AuthSession = {
  session: { id: string; userId: string };
  user: { id: string; name: string; email: string };
};
