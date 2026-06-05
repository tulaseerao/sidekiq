import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, PRIORITY_CONFIG, initials } from '@/lib/utils'
import { Calendar, MessageSquare, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  const userId = session!.user.id

  const [myTasks, projects, recentActivity] = await Promise.all([
    prisma.task.findMany({
      where: { assignees: { some: { userId } }, column: { name: { not: 'Done' } } },
      include: {
        column: true,
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    }),
    prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { tasks: true } }, members: { include: { user: { select: { id: true, name: true, color: true } } }, take: 5 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.activity.findMany({
      where: { task: { project: { members: { some: { userId } } } } },
      include: {
        user: { select: { name: true, color: true } },
        task: { select: { title: true, projectId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Good morning, {session!.user.name?.split(' ')[0]}
        </h1>
        <p className="text-text-secondary mt-1">Here&apos;s what&apos;s on your plate today.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="My open tasks" value={myTasks.length} color="#6366f1" />
        <StatCard
          label="Urgent / High"
          value={myTasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length}
          color="#f43f5e"
        />
        <StatCard label="Projects" value={projects.length} color="#22c55e" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">My Tasks</h2>
          </div>

          {myTasks.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-text-secondary">No open tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => {
                const p = PRIORITY_CONFIG[task.priority]
                return (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project.id}?task=${task.id}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/40 transition-colors group"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary group-hover:text-primary transition-colors truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ color: p.color, backgroundColor: p.bg }}
                        >
                          {p.label}
                        </span>
                        <span className="text-xs text-muted">{task.project.name}</span>
                        <span className="text-xs text-muted">{task.column.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted text-xs">
                      {task._count.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} /> {task._count.comments}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-text-primary mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex gap-2.5 text-xs text-text-secondary">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: a.user.color }}
                  >
                    {initials(a.user.name)}
                  </div>
                  <p className="leading-relaxed">
                    <span className="text-text-primary">{a.user.name}</span>{' '}
                    {a.action}{' '}
                    <span className="text-text-primary truncate">
                      {a.task.title.length > 30 ? a.task.title.slice(0, 30) + '…' : a.task.title}
                    </span>
                    {a.details && <span className="text-muted"> · {a.details}</span>}
                  </p>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-xs text-muted">No recent activity.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-primary">Projects</h2>
              <Link href="/projects" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1">
                All <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5 hover:border-primary/40 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-text-primary flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-muted">{p._count.tasks}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-text-secondary text-sm">{label}</p>
      <p className="text-3xl font-semibold mt-1" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
