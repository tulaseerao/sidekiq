import { PRIORITY_CONFIG } from '@/lib/utils'
import type { Priority } from '@prisma/client'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_CONFIG[priority]
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded font-medium"
      style={{ color: p.color, backgroundColor: p.bg }}
    >
      {p.label}
    </span>
  )
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const p = PRIORITY_CONFIG[priority]
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} title={p.label} />
}
