import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
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
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
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
  });
}
