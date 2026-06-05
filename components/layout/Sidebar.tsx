'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, FolderKanban, Plus, LogOut, Settings } from 'lucide-react'
import { cn, initials } from '@/lib/utils'

interface Project {
  id: string
  name: string
  color: string
}

interface SidebarProps {
  projects: Project[]
}

export function Sidebar({ projects }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <aside className="w-60 min-h-screen bg-[#0c1020] border-r border-border flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <span className="font-semibold text-text-primary">DevTrack</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={15} />} active={pathname === '/dashboard'}>
          Dashboard
        </NavItem>
        <NavItem href="/projects" icon={<FolderKanban size={15} />} active={pathname === '/projects'}>
          All Projects
        </NavItem>

        {projects.length > 0 && (
          <div className="pt-4 pb-1">
            <p className="text-xs font-medium text-muted px-2 uppercase tracking-wider mb-1">Projects</p>
            {projects.map((p) => (
              <NavItem
                key={p.id}
                href={`/projects/${p.id}`}
                active={pathname === `/projects/${p.id}`}
                icon={
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                }
              >
                <span className="truncate">{p.name}</span>
              </NavItem>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => router.push('/projects/new')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted hover:text-text-secondary rounded-lg hover:bg-surface transition-colors"
          >
            <Plus size={14} />
            New project
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: session?.user?.color ?? '#6366f1' }}
          >
            {initials(session?.user?.name ?? 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-muted hover:text-text-secondary transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  icon,
  active,
  children,
}: {
  href: string
  icon: React.ReactNode
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
        active
          ? 'bg-primary/15 text-primary font-medium'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
      )}
    >
      {icon}
      {children}
    </Link>
  )
}
