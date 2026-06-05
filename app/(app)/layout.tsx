import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true, color: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
