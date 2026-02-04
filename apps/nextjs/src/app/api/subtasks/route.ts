import { auth } from '@/lib/auth';
import { db, subtasks } from '@/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createSubtaskSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, title } = createSubtaskSchema.parse(body);

    const now = new Date();
    const newSubtask = {
      id: crypto.randomUUID(),
      taskId,
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(subtasks).values(newSubtask);
    return NextResponse.json({ data: newSubtask }, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 });
  }
}
