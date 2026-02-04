export const auth = {
  api: {
    getSession: async () => {
      return {
        session: {
          id: 'session-1',
          userId: 'user-1',
        },
        user: {
          id: 'user-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
      };
    },
  },
};

export type Session = {
  session: { id: string; userId: string };
  user: { id: string; name: string; email: string };
};

export type User = {
  id: string;
  name: string;
  email: string;
};
