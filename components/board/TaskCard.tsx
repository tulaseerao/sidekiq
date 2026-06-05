'use client'

import { Draggable } from '@hello-pangea/dnd'
import { MessageSquare, Calendar } from 'lucide-react'
import { formatDate, initials, PRIORITY_CONFIG } from '@/lib/utils'
import { PriorityDot } from '@/components/tasks/PriorityBadge'

interface Assignee {
  user: { id: string; name: string; color: string }
}

interface Label {
  label: { id: string; name: string; color: string }
}

interface Task {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string | null
  assignees: Assignee[]
  labels: Label[]
  _count: { comments: number }
}

interface TaskCardProps {
  task: Task
  index: number
  onClick: (taskId: string) => void
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const p = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className={`bg-card border rounded-lg p-3 cursor-pointer group transition-all select-none ${
            snapshot.isDragging
              ? 'border-primary shadow-modal rotate-1 opacity-95'
              : 'border-border hover:border-border-subtle hover:shadow-card'
          }`}
        >
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map(({ label }) => (
                <span
                  key={label.id}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ color: label.color, backgroundColor: label.color + '25' }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2">
            <PriorityDot priority={task.priority} />
            <p className="text-sm text-text-primary leading-snug group-hover:text-primary transition-colors flex-1">
              {task.title}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              {task._count.comments > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <MessageSquare size={10} />
                  {task._count.comments}
                </span>
              )}
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-400' : 'text-muted'}`}>
                  <Calendar size={10} />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {task.assignees.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 3).map(({ user }) => (
                  <div
                    key={user.id}
                    className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-white text-[9px] font-semibold"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {initials(user.name)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
