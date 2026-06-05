import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function isMember(projectId: string, userId: string) {
  const m = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  })
  return !!m
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await isMember(params.id, session.user.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      columns: { orderBy: { position: 'asc' } },
      members: {
        include: { user: { select: { id: true, name: true, color: true, email: true } } },
      },
      labels: true,
      tasks: {
        include: {
          assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
          labels: { include: { label: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await isMember(params.id, session.user.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data = await req.json()
  const project = await prisma.project.update({
    where: { id: params.id },
    data: { name: data.name, description: data.description, color: data.color },
  })
  return NextResponse.json(project)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: session.user.id } },
  })
  if (!member || member.role !== 'owner')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
