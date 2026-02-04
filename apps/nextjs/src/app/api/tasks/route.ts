import { auth } from '@/lib/auth';
import { db, tasks, subtasks } from '@/db';
import { eq, and, desc, asc, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const conditions = [eq(tasks.userId, session.user.id)];

    if (status) {
      conditions.push(eq(tasks.status, status as 'todo' | 'in_progress' | 'done'));
    }

    if (priority) {
      conditions.push(eq(tasks.priority, priority as 'low' | 'medium' | 'high'));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(tasks.title, searchTerm),
          like(tasks.description || '', searchTerm)
        )!
      );
    }

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    const tasksWithSubtasks = await Promise.all(
      result.map(async (task) => {
        const taskSubtasks = await db
          .select()
          .from(subtasks)
          .where(eq(subtasks.taskId, task.id));
        return {
          ...task,
          subtasks: taskSubtasks,
        };
      })
    );

    return NextResponse.json({ data: tasksWithSubtasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const input = createTaskSchema.parse(body);

    const now = new Date();
    const newTask = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ? new Date(input.dueDate).getTime() : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(newTask);
    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
