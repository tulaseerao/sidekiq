'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { TaskModal } from '@/components/tasks/TaskModal'
import { Plus, UserPlus, X } from 'lucide-react'

interface Member { user: { id: string; name: string; color: string; email: string } }
interface Label { id: string; name: string; color: string }

interface Column {
  id: string
  name: string
  color: string
  tasks: any[]
}

interface Project {
  id: string
  name: string
  color: string
  columns: Column[]
  members: Member[]
  labels: Label[]
}

export function KanbanBoard({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState(initialProject)
  const [activeTask, setActiveTask] = useState<string | null>(null)
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColName, setNewColName] = useState('')

  function getColumnsWithTasks() {
    return project.columns.map((col) => ({
      ...col,
      tasks: project.columns
        .find((c) => c.id === col.id)
        ?.tasks ?? [],
    }))
  }

  const columnsWithTasks = project.columns.map((col) => ({
    ...col,
    tasks: (col as any).tasks ?? [],
  }))

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCol = columnsWithTasks.find((c) => c.id === source.droppableId)!
    const destCol = columnsWithTasks.find((c) => c.id === destination.droppableId)!

    const sourceTasks = [...sourceCol.tasks]
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : [...destCol.tasks]

    const [movedTask] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, movedTask)

    const prevTask = destTasks[destination.index - 1]
    const nextTask = destTasks[destination.index + 1]
    const newPosition =
      prevTask && nextTask
        ? (prevTask.position + nextTask.position) / 2
        : prevTask
        ? prevTask.position + 1000
        : nextTask
        ? nextTask.position / 2
        : 1000

    setProject((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id === source.droppableId && col.id === destination.droppableId) {
          return { ...col, tasks: destTasks.map((t, i) => (t.id === draggableId ? { ...t, position: newPosition, columnId: destination.droppableId } : t)) }
        }
        if (col.id === source.droppableId) return { ...col, tasks: sourceTasks }
        if (col.id === destination.droppableId) return { ...col, tasks: destTasks.map((t) => (t.id === draggableId ? { ...t, columnId: destination.droppableId, position: newPosition } : t)) }
        return col
      }),
    }))

    await fetch(`/api/tasks/${draggableId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: destination.droppableId, position: newPosition }),
    })
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim() || !addingToColumn) return

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle,
        columnId: addingToColumn,
        projectId: project.id,
        priority: 'MEDIUM',
      }),
    })
    const task = await res.json()

    setProject((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === addingToColumn ? { ...col, tasks: [...(col as any).tasks, task] } : col
      ),
    }))
    setNewTaskTitle('')
    setAddingToColumn(null)
  }

  function handleTaskUpdate(updated: any) {
    setProject((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: (col as any).tasks.map((t: any) => (t.id === updated.id ? { ...t, ...updated } : t)),
      })),
    }))
  }

  function handleTaskDelete(taskId: string) {
    setProject((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: (col as any).tasks.filter((t: any) => t.id !== taskId),
      })),
    }))
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/projects/${project.id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    if (res.ok) {
      const m = await res.json()
      setProject((prev) => ({ ...prev, members: [...prev.members, m] }))
      setInviteEmail('')
      setInviteMsg('Member added!')
      setTimeout(() => setInviteMsg(''), 3000)
    } else {
      const d = await res.json()
      setInviteMsg(d.error ?? 'Failed')
    }
  }

  async function addColumn(e: React.FormEvent) {
    e.preventDefault()
    if (!newColName.trim()) return
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newColName, projectId: project.id }),
    })
    const col = await res.json()
    setProject((prev) => ({ ...prev, columns: [...prev.columns, { ...col, tasks: [] }] }))
    setNewColName('')
    setShowAddColumn(false)
  }

  const totalTasks = project.columns.reduce((s, c) => s + ((c as any).tasks?.length ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: project.color }}>
            {project.name[0]}
          </div>
          <div>
            <h1 className="font-semibold text-text-primary">{project.name}</h1>
            <p className="text-xs text-muted">{totalTasks} task{totalTasks !== 1 ? 's' : ''} · {project.members.length} member{project.members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {project.members.slice(0, 5).map(({ user }) => (
              <div
                key={user.id}
                className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-white text-[10px] font-semibold"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border hover:border-primary/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <UserPlus size={13} /> Invite
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="px-6 py-3 border-b border-border bg-surface flex items-center gap-3">
          <form onSubmit={inviteMember} className="flex items-center gap-2 flex-1">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address to invite"
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary transition-colors w-64"
            />
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              Add member
            </button>
            {inviteMsg && <span className="text-xs text-text-secondary">{inviteMsg}</span>}
          </form>
          <button onClick={() => setShowInvite(false)} className="text-muted hover:text-text-secondary">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 p-6 h-full items-start">
            {project.columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col as any}
                onAddTask={(colId) => { setAddingToColumn(colId); setNewTaskTitle('') }}
                onTaskClick={(id) => setActiveTask(id)}
              />
            ))}

            {addingToColumn && (
              <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={() => setAddingToColumn(null)}>
                <div className="absolute inset-0 bg-black/50" />
                <form
                  onSubmit={addTask}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-card border border-border rounded-xl p-5 w-80 shadow-modal animate-slide-up"
                >
                  <h3 className="font-medium text-text-primary mb-3">New task</h3>
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title…"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-primary transition-colors mb-3"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!newTaskTitle.trim()} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                      Add task
                    </button>
                    <button type="button" onClick={() => setAddingToColumn(null)} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showAddColumn ? (
              <form onSubmit={addColumn} className="kanban-column">
                <input
                  autoFocus
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Column name…"
                  className="w-full bg-card border border-primary rounded-lg px-3 py-2 text-sm text-text-primary mb-2"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={!newColName.trim()} className="flex-1 bg-primary text-white text-sm py-1.5 rounded-lg disabled:opacity-50">
                    Add
                  </button>
                  <button type="button" onClick={() => setShowAddColumn(false)} className="px-3 text-sm text-text-secondary border border-border rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="kanban-column flex items-center gap-2 text-muted hover:text-text-secondary px-4 py-3 border border-dashed border-border rounded-xl hover:border-primary/40 transition-colors text-sm"
              >
                <Plus size={14} /> Add column
              </button>
            )}
          </div>
        </DragDropContext>
      </div>

      <TaskModal
        taskId={activeTask}
        projectMembers={project.members}
        projectLabels={project.labels}
        onClose={() => setActiveTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </div>
  )
}
