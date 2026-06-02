import { useState } from 'react'
import { usePledge } from '../hooks/usePledge'
import { useTimer } from '../hooks/useTimer'

function PledgeChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        selected
          ? 'bg-[#C17A47] border-[#C17A47] text-white shadow-[0_0_12px_rgba(193,122,71,0.3)]'
          : 'bg-[#1E2028] border-[#2A2D38] text-[#8B8FA8] hover:border-[#C17A47]/40 hover:text-[#E8E8F0]'
      }`}
    >
      {label}
    </button>
  )
}

function PledgeEntry({ pledge, timerName }) {
  return (
    <div className="bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-3">
      {timerName && (
        <span className="text-xs font-semibold text-[#C17A47] mb-1 block">{timerName}</span>
      )}
      <p className="text-[#B0B3C6] text-sm italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
        &quot;{pledge.pledge_text}&quot;
      </p>
    </div>
  )
}

const PRESET_REASONS = [
  "My physical & mental health",
  "To show up for my loved ones",
  "To feel clear-headed and present",
  "To reclaim control over my life",
  "To build a better, brighter future",
  "I deserve a clean, healthy life"
]

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
    <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#E8E8F0]">Today&apos;s Pledge</h3>
        {pledgeStreak > 0 && (
          <span className="text-xs bg-[#C17A47]/15 text-[#E8955A] border border-[#C17A47]/20 px-2.5 py-1 rounded-full font-semibold">
            🔥 {pledgeStreak}-day streak
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

      {existingPledge ? (
        <div className="space-y-2">
          <PledgeEntry pledge={existingPledge} timerName={selectedTimerId ? selectedLabel : null} />
          <p className="text-[#6DBF87] text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Pledge made today
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-[#8B8FA8] text-sm">
              Why are you staying clean{selectedTimerId ? ` from ${selectedLabel}` : ''} today?
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="I am staying clean today because…"
              rows={3}
              className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-3 text-[#E8E8F0] placeholder-[#8B8FA8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47]/50 focus:border-[#C17A47]/50 resize-none transition-all"
            />
          </div>

          {/* Quick Reasons List */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[#8B8FA8] uppercase tracking-wider">
              Or select a reason
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_REASONS.map((reason) => {
                const isSelected = text === reason
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => isSelected ? setText('') : setText(reason)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all duration-200 cursor-pointer active:scale-98 select-none ${
                      isSelected
                        ? 'bg-[#C17A47]/10 border-[#C17A47] text-[#E8955A] shadow-[0_2px_8px_rgba(193,122,71,0.15)]'
                        : 'bg-[#1E2028] border-[#2A2D38] text-[#8B8FA8] hover:border-[#8B8FA8]/40 hover:text-[#E8E8F0]'
                    }`}
                  >
                    {reason}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="w-full bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-[0_2px_12px_rgba(193,122,71,0.25)] hover:shadow-[0_4px_20px_rgba(193,122,71,0.35)] cursor-pointer"
          >
            {saving ? 'Saving…' : 'Make my pledge'}
          </button>
        </form>
      )}

      {/* Other pledges today */}
      {todayPledges.length > 1 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] text-[#8B8FA8] uppercase tracking-widest font-semibold">Other pledges today</p>
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
