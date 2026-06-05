import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color, projectId } = await req.json()
  const label = await prisma.label.create({ data: { name, color, projectId } })
  return NextResponse.json(label, { status: 201 })
}
