import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 })

  const member = await prisma.projectMember.create({
    data: { projectId: params.id, userId: user.id, role: 'member' },
    include: { user: { select: { id: true, name: true, color: true, email: true } } },
  })
  return NextResponse.json(member, { status: 201 })
}
