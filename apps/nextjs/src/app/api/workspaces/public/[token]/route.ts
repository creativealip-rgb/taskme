import { db, workspaces, tasks } from '@/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.shareToken, token))
      .limit(1);

    if (!workspace[0]) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (!workspace[0].isPublic) {
      return NextResponse.json({ error: 'Workspace is not public' }, { status: 403 });
    }

    const workspaceTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspace[0].id));

    return NextResponse.json({
      data: {
        workspace: workspace[0],
        tasks: workspaceTasks,
      },
    });
  } catch (error) {
    console.error('Error fetching public workspace:', error);
    return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 });
  }
}
