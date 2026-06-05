import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const colors = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4']
  const color = colors[Math.floor(Math.random() * colors.length)]

  const user = await prisma.user.create({
    data: { name, email, password: hashed, color },
  })

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
}
