import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { initials, formatDate } from '@/lib/utils'
import { Plus, FolderKanban } from 'lucide-react'

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)!

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session!.user.id } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, color: true } } },
        take: 5,
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
          <FolderKanban size={40} className="mx-auto text-muted mb-4" />
          <h3 className="font-medium text-text-primary mb-1">No projects yet</h3>
          <p className="text-text-secondary text-sm mb-4">Create your first project to get started</p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Create project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-card group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <span className="text-xs text-muted bg-surface px-2 py-1 rounded-lg">
                  {p._count.tasks} tasks
                </span>
              </div>

              {p.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{p.description}</p>
              )}

              <div className="flex items-center gap-1">
                {p.members.slice(0, 5).map((m) => (
                  <div
                    key={m.user.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold border-2 border-card"
                    style={{ backgroundColor: m.user.color }}
                    title={m.user.name}
                  >
                    {initials(m.user.name)}
                  </div>
                ))}
                {p.members.length > 5 && (
                  <span className="text-xs text-muted ml-1">+{p.members.length - 5}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
