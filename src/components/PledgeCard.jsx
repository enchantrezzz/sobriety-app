import { useState } from 'react'
import { usePledge } from '../hooks/usePledge'

export default function PledgeCard() {
  const { todayPledge, pledgeStreak, loading, submitPledge } = usePledge()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      await submitPledge(text.trim())
      setText('')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Today&apos;s Pledge</h3>
        {pledgeStreak > 0 && (
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-medium">
            🔥 {pledgeStreak}-day streak
          </span>
        )}
      </div>

      {todayPledge ? (
        <div>
          <p className="text-slate-300 italic">&quot;{todayPledge.pledge_text}&quot;</p>
          <p className="text-slate-500 text-xs mt-3">Pledge made today ✓</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-slate-400 text-sm">Why are you staying clean today?</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I am staying clean today because…"
            rows={3}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Make my pledge'}
          </button>
        </form>
      )}
    </div>
  )
}
