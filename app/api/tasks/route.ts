import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, priority, columnId, projectId, dueDate, assigneeIds, labelIds } =
    await req.json()

  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const position = (lastTask?.position ?? 0) + 1000

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority ?? 'MEDIUM',
      position,
      columnId,
      projectId,
      createdById: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignees: assigneeIds?.length
        ? { create: assigneeIds.map((id: string) => ({ userId: id })) }
        : undefined,
      labels: labelIds?.length
        ? { create: labelIds.map((id: string) => ({ labelId: id })) }
        : undefined,
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
  })

  await prisma.activity.create({
    data: { taskId: task.id, userId: session.user.id, action: 'created' },
  })

  return NextResponse.json(task, { status: 201 })
}
