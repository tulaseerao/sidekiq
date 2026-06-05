'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-semibold text-text-primary">DevTrack</span>
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">Create your account</h1>
        <p className="text-text-secondary mt-1">Join your team on DevTrack</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-modal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
              required
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              required
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
