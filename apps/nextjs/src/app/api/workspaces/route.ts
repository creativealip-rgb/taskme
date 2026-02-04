import { auth } from '@/lib/auth';
import { db, workspaces, tasks } from '@/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, session.user.id));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = createWorkspaceSchema.parse(body);

    const shareToken = crypto.randomUUID().slice(0, 8);
    const now = new Date();

    const workspace = {
      id: crypto.randomUUID(),
      name,
      description: description ?? null,
      ownerId: session.user.id,
      isPublic: false,
      shareToken,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(workspaces).values(workspace);
    return NextResponse.json({ data: workspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
