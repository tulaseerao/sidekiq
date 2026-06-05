import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, color: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color: color ?? '#6366f1',
      members: { create: { userId: session.user.id, role: 'owner' } },
      columns: {
        create: [
          { name: 'Backlog', position: 0, color: '#64748b' },
          { name: 'To Do', position: 1, color: '#6366f1' },
          { name: 'In Progress', position: 2, color: '#f59e0b' },
          { name: 'Review', position: 3, color: '#8b5cf6' },
          { name: 'Done', position: 4, color: '#22c55e' },
        ],
      },
    },
    include: { members: true, columns: true },
  })

  return NextResponse.json(project, { status: 201 })
}
