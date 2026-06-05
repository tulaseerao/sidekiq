import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KanbanBoard } from '@/components/board/KanbanBoard'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: session.user.id } },
  })
  if (!member) notFound()

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            include: {
              assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
              labels: { include: { label: true } },
              _count: { select: { comments: true } },
            },
            orderBy: { position: 'asc' },
          },
        },
      },
      members: {
        include: { user: { select: { id: true, name: true, color: true, email: true } } },
      },
      labels: true,
    },
  })

  if (!project) notFound()

  return <KanbanBoard initialProject={project as any} />
}
