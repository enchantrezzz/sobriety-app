import { useState } from 'react'
import { usePledge } from '../hooks/usePledge'
import { useTimer } from '../hooks/useTimer'

function PledgeChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

function PledgeEntry({ pledge, timerName }) {
  return (
    <div className="bg-slate-700/50 rounded-xl px-4 py-3">
      {timerName && (
        <span className="text-xs font-medium text-indigo-400 mb-1 block">{timerName}</span>
      )}
      <p className="text-slate-300 text-sm italic">&quot;{pledge.pledge_text}&quot;</p>
    </div>
  )
}

export default function PledgeCard() {
  const { todayPledges, pledgeStreak, loading, submitPledge } = usePledge()
  const { timers } = useTimer()

  // null = General, timer.id = specific addiction
  const [selectedTimerId, setSelectedTimerId] = useState(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      await submitPledge(text.trim(), selectedTimerId)
      setText('')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  // Which pledge exists for the currently selected scope?
  const existingPledge = todayPledges.find(p =>
    selectedTimerId ? p.timer_id === selectedTimerId : p.timer_id === null
  )

  const selectedLabel = selectedTimerId
    ? (timers.find(t => t.id === selectedTimerId)?.addiction_name ?? 'Addiction')
    : 'General'

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Today&apos;s Pledge</h3>
        {pledgeStreak > 0 && (
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-medium">
            🔥 {pledgeStreak}-day streak
          </span>
        )}
      </div>

      {/* Scope chips — only shown if user has active timers */}
      {timers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <PledgeChip
            label="General"
            selected={selectedTimerId === null}
            onClick={() => setSelectedTimerId(null)}
          />
          {timers.map(t => (
            <PledgeChip
              key={t.id}
              label={t.addiction_name}
              selected={selectedTimerId === t.id}
              onClick={() => setSelectedTimerId(t.id)}
            />
          ))}
        </div>
      )}

      {/* Pledge form or existing pledge for selected scope */}
      {existingPledge ? (
        <div className="space-y-2">
          <PledgeEntry
            pledge={existingPledge}
            timerName={selectedTimerId ? selectedLabel : null}
          />
          <p className="text-slate-500 text-xs mt-1">Pledge made today ✓</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-slate-400 text-sm">
            Why are you staying clean{selectedTimerId ? ` from ${selectedLabel}` : ''} today?
          </p>
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

      {/* Show all other pledges made today */}
      {todayPledges.length > 1 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Other pledges today</p>
          {todayPledges
            .filter(p => selectedTimerId ? p.timer_id !== selectedTimerId : p.timer_id !== null)
            .map(p => {
              const timerName = p.timer_id
                ? (timers.find(t => t.id === p.timer_id)?.addiction_name ?? 'Addiction')
                : 'General'
              return <PledgeEntry key={p.id} pledge={p} timerName={timerName} />
            })}
        </div>
      )}
    </div>
  )
}
