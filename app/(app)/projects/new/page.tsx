'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#64748b',
]

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)

    if (res.ok) {
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } else {
      setError('Failed to create project')
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ArrowLeft size={14} /> Back
      </Link>

      <h1 className="text-2xl font-semibold text-text-primary mb-6">New project</h1>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Project name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mobile App v2"
              required
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description <span className="text-muted">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: form.color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: form.color }}>
              {form.name[0] ?? 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{form.name || 'Project name'}</p>
              <p className="text-xs text-muted">5 default columns will be created</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !form.name}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating...' : 'Create project'}
          </button>
        </form>
      </div>
    </div>
  )
}
