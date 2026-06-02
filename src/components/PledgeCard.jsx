import { useState } from 'react'
import { usePledge } from '../hooks/usePledge'
import { useTimer } from '../hooks/useTimer'

function PledgeChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
        selected
          ? 'bg-[#C17A47] border-[#C17A47] text-white'
          : 'bg-[#F5EDE0] border-[#DCC9B4] text-[#5C4033] hover:border-[#C17A47]/50 hover:text-[#3D2B1F]'
      }`}
    >
      {label}
    </button>
  )
}

function PledgeEntry({ pledge, timerName }) {
  return (
    <div className="bg-[#F5EDE0] rounded-xl px-4 py-3">
      {timerName && (
        <span className="text-xs font-medium text-[#C17A47] mb-1 block">{timerName}</span>
      )}
      <p className="text-[#5C4033] text-sm italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>&quot;{pledge.pledge_text}&quot;</p>
    </div>
  )
}

export default function PledgeCard() {
  const { todayPledges, pledgeStreak, loading, submitPledge } = usePledge()
  const { timers } = useTimer()

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

  const existingPledge = todayPledges.find(p =>
    selectedTimerId ? p.timer_id === selectedTimerId : p.timer_id === null
  )

  const selectedLabel = selectedTimerId
    ? (timers.find(t => t.id === selectedTimerId)?.addiction_name ?? 'Addiction')
    : 'General'

  return (
    <div className="card p-6 shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3D2B1F]">Today&apos;s Pledge</h3>
        {pledgeStreak > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
            {pledgeStreak}-day streak
          </span>
        )}
      </div>

      {/* Scope chips */}
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

      {/* Pledge form or existing pledge */}
      {existingPledge ? (
        <div className="space-y-2">
          <PledgeEntry
            pledge={existingPledge}
            timerName={selectedTimerId ? selectedLabel : null}
          />
          <p className="text-[#A69080] text-xs mt-1">Pledge made today ✓</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-[#8C7264] text-sm">
            Why are you staying clean{selectedTimerId ? ` from ${selectedLabel}` : ''} today?
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I am staying clean today because…"
            rows={3}
            className="w-full bg-[#F5EDE0] border border-[#DCC9B4] rounded-lg px-4 py-2.5 text-[#3D2B1F] placeholder-[#A69080] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47] resize-none"
          />
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="w-full bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {saving ? 'Saving…' : 'Make my pledge'}
          </button>
        </form>
      )}

      {/* Other pledges today */}
      {todayPledges.length > 1 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-[#A69080] uppercase tracking-wider">Other pledges today</p>
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
