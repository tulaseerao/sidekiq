'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatDate, initials } from '@/lib/utils'
import { Send } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; color: string }
}

interface CommentThreadProps {
  taskId: string
  initialComments: Comment[]
}

export function CommentThread({ taskId, initialComments }: CommentThreadProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)

    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })

    const comment = await res.json()
    setComments([...comments, comment])
    setText('')
    setPosting(false)
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
        Comments ({comments.length})
      </p>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: c.user.color }}
            >
              {initials(c.user.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-medium text-text-primary">{c.user.name}</span>
                <span className="text-[10px] text-muted">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-muted">No comments yet. Be the first!</p>
        )}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-1"
          style={{ backgroundColor: session?.user?.color ?? '#6366f1' }}
        >
          {initials(session?.user?.name ?? 'U')}
        </div>
        <div className="flex-1 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary transition-colors resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e)
            }}
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  )
}
