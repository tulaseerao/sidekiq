import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { content, taskId: params.id, userId: session.user.id },
    include: { user: { select: { id: true, name: true, color: true } } },
  })

  await prisma.activity.create({
    data: { taskId: params.id, userId: session.user.id, action: 'commented' },
  })

  return NextResponse.json(comment, { status: 201 })
}
