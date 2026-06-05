import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color, projectId } = await req.json()

  const last = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
  })

  const column = await prisma.column.create({
    data: { name, color: color ?? '#64748b', position: (last?.position ?? -1) + 1, projectId },
  })
  return NextResponse.json(column, { status: 201 })
}
