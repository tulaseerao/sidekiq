'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'

interface Task {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string | null
  assignees: any[]
  labels: any[]
  _count: { comments: number }
}

interface Column {
  id: string
  name: string
  color: string
  tasks: Task[]
}

interface KanbanColumnProps {
  column: Column
  onAddTask: (columnId: string) => void
  onTaskClick: (taskId: string) => void
}

export function KanbanColumn({ column, onAddTask, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="kanban-column flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-medium text-text-primary">{column.name}</span>
          <span className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded-md">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-muted hover:text-text-secondary transition-colors p-0.5 rounded hover:bg-surface"
          title="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 min-h-[80px] rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}

            <button
              onClick={() => onAddTask(column.id)}
              className="w-full text-left px-2 py-1.5 text-xs text-muted hover:text-text-secondary rounded-lg hover:bg-surface transition-colors flex items-center gap-1.5"
            >
              <Plus size={11} />
              Add task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
