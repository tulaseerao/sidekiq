import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { columnId, position } = await req.json()

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { column: true },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: { columnId, position },
  })

  if (task.columnId !== columnId) {
    const newCol = await prisma.column.findUnique({ where: { id: columnId } })
    await prisma.activity.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        action: 'moved',
        details: `from "${task.column.name}" to "${newCol?.name}"`,
      },
    })
  }

  return NextResponse.json(updated)
}
