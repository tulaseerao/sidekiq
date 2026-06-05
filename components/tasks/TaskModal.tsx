'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Calendar, User, Tag, MessageSquare, Clock } from 'lucide-react'
import { formatDate, initials, PRIORITY_CONFIG } from '@/lib/utils'
import { CommentThread } from './CommentThread'

interface TaskModalProps {
  taskId: string | null
  projectMembers: { user: { id: string; name: string; color: string } }[]
  projectLabels: { id: string; name: string; color: string }[]
  onClose: () => void
  onUpdate: (task: any) => void
  onDelete: (taskId: string) => void
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export function TaskModal({ taskId, projectMembers, projectLabels, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!taskId) return
    setLoading(true)
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((t) => {
        setTask(t)
        setTitle(t.title)
        setDescription(t.description ?? '')
        setLoading(false)
      })
  }, [taskId])

  async function patch(data: Record<string, any>) {
    setSaving(true)
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setTask(updated)
    onUpdate(updated)
    setSaving(false)
    return updated
  }

  async function saveTitle() {
    if (title.trim() && title !== task.title) await patch({ title })
    setEditTitle(false)
  }

  async function saveDescription() {
    await patch({ description })
  }

  async function toggleAssignee(userId: string) {
    const current = task.assignees.map((a: any) => a.user.id)
    const next = current.includes(userId) ? current.filter((id: string) => id !== userId) : [...current, userId]
    await patch({ assigneeIds: next })
  }

  async function toggleLabel(labelId: string) {
    const current = task.labels.map((l: any) => l.label.id)
    const next = current.includes(labelId) ? current.filter((id: string) => id !== labelId) : [...current, labelId]
    await patch({ labelIds: next })
  }

  if (!taskId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-modal w-full max-w-3xl max-h-[90vh] flex overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                {editTitle ? (
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                    className="flex-1 text-xl font-semibold bg-surface border border-primary rounded-lg px-3 py-1.5 text-text-primary"
                  />
                ) : (
                  <h2
                    className="flex-1 text-xl font-semibold text-text-primary cursor-text hover:text-primary transition-colors"
                    onClick={() => setEditTitle(true)}
                    title="Click to edit"
                  >
                    {task.title}
                  </h2>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={async () => {
                      if (confirm('Delete this task?')) {
                        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
                        onDelete(taskId)
                        onClose()
                      }
                    }}
                    className="p-1.5 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button onClick={onClose} className="p-1.5 text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-5">
                <span className="text-xs text-muted bg-surface border border-border px-2 py-1 rounded-lg">
                  {task.column.name}
                </span>
                {saving && <span className="text-xs text-muted">Saving…</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  placeholder="Add a description…"
                  rows={4}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="mt-6">
                <CommentThread taskId={taskId} initialComments={task.comments} />
              </div>
            </div>

            <div className="w-56 border-l border-border p-4 space-y-5 overflow-y-auto bg-[#161b27]">
              <Section title="Priority" icon={<Clock size={12} />}>
                <div className="space-y-1">
                  {PRIORITIES.map((pr) => {
                    const p = PRIORITY_CONFIG[pr]
                    return (
                      <button
                        key={pr}
                        onClick={() => patch({ priority: pr })}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          task.priority === pr ? 'bg-surface border border-border' : 'hover:bg-surface'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-text-secondary">{p.label}</span>
                        {task.priority === pr && <span className="ml-auto text-primary text-[10px]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section title="Assignees" icon={<User size={12} />}>
                <div className="space-y-1">
                  {projectMembers.map(({ user }) => {
                    const assigned = task.assignees.some((a: any) => a.user.id === user.id)
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleAssignee(user.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          assigned ? 'bg-surface border border-border' : 'hover:bg-surface'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0"
                          style={{ backgroundColor: user.color }}
                        >
                          {initials(user.name)}
                        </div>
                        <span className="text-text-secondary truncate">{user.name}</span>
                        {assigned && <span className="ml-auto text-primary text-[10px]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section title="Labels" icon={<Tag size={12} />}>
                <div className="space-y-1">
                  {projectLabels.map((label) => {
                    const active = task.labels.some((l: any) => l.label.id === label.id)
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          active ? 'bg-surface border border-border' : 'hover:bg-surface'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="text-text-secondary">{label.name}</span>
                        {active && <span className="ml-auto text-primary text-[10px]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section title="Due date" icon={<Calendar size={12} />}>
                <input
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => patch({ dueDate: e.target.value || null })}
                  className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-secondary focus:border-primary transition-colors"
                />
              </Section>

              <Section title="Activity" icon={<MessageSquare size={12} />}>
                <div className="space-y-2">
                  {task.activities?.slice(0, 6).map((a: any) => (
                    <div key={a.id} className="text-[11px] text-text-secondary leading-relaxed">
                      <span className="text-text-primary">{a.user.name}</span>{' '}
                      {a.action}
                      {a.details && <span className="text-muted"> {a.details}</span>}
                      <div className="text-muted text-[10px]">{formatDate(a.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="text-[10px] text-muted pt-2 border-t border-border">
                Created {formatDate(task.createdAt)} by {task.createdBy.name}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-muted">{icon}</span>
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  )
}
