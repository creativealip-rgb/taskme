import { auth } from '@/lib/auth';
import { db, subtasks } from '@/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSubtaskSchema = z.object({
  title: z.string().optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const input = updateSubtaskSchema.parse(body);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.completed !== undefined) updates.completed = input.completed;

    await db.update(subtasks).set(updates).where(eq(subtasks.id, id));

    const result = await db.select().from(subtasks).where(eq(subtasks.id, id)).limit(1);
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(subtasks).where(eq(subtasks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
