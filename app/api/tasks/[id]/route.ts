import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'asc' },
      },
      activities: {
        include: { user: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      column: true,
      createdBy: { select: { id: true, name: true, color: true } },
    },
  })

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, priority, dueDate, assigneeIds, labelIds } = await req.json()

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updates: string[] = []
  if (title !== undefined && title !== task.title) updates.push(`title to "${title}"`)
  if (priority !== undefined && priority !== task.priority) updates.push(`priority to ${priority}`)
  if (dueDate !== undefined) updates.push('due date')

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeIds !== undefined && {
        assignees: {
          deleteMany: {},
          create: assigneeIds.map((id: string) => ({ userId: id })),
        },
      }),
      ...(labelIds !== undefined && {
        labels: {
          deleteMany: {},
          create: labelIds.map((id: string) => ({ labelId: id })),
        },
      }),
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
  })

  if (updates.length > 0) {
    await prisma.activity.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        action: 'updated',
        details: `Changed ${updates.join(', ')}`,
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
