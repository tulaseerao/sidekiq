'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
      router.refresh()
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
        <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
        <p className="text-text-secondary mt-1">Sign in to your workspace</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-modal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        No account?{' '}
        <Link href="/register" className="text-primary hover:text-primary-hover transition-colors">
          Create one
        </Link>
      </p>

      <p className="text-center text-xs text-muted mt-6 border border-border rounded-lg p-3 bg-surface">
        Demo: <span className="font-mono text-text-secondary">alice@devtrack.io</span> / <span className="font-mono text-text-secondary">password123</span>
      </p>
    </div>
  )
}
