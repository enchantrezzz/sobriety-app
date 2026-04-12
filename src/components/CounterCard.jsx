import { useEffect, useState } from 'react'
import { MILESTONES_DAYS } from '../hooks/useTimer'

function pad(n) {
  return String(n).padStart(2, '0')
}

function getElapsed(startedAt) {
  const diff = Date.now() - new Date(startedAt).getTime()
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function nextMilestone(days) {
  return MILESTONES_DAYS.find(m => m > days) ?? null
}

export default function CounterCard({ timer, onReset, onArchive }) {
  const [elapsed, setElapsed] = useState(getElapsed(timer.started_at))

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(timer.started_at)), 1000)
    return () => clearInterval(id)
  }, [timer.started_at])

  const next = nextMilestone(elapsed.days)

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{timer.addiction_name}</h3>
        <button
          onClick={onArchive}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          title="Archive timer"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-4 justify-center my-6">
        {[
          { value: elapsed.days, label: 'days' },
          { value: pad(elapsed.hours), label: 'hrs' },
          { value: pad(elapsed.minutes), label: 'min' },
          { value: pad(elapsed.seconds), label: 'sec' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-white font-mono">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {next && (
        <p className="text-center text-slate-400 text-xs mb-4">
          {next - elapsed.days} day{next - elapsed.days !== 1 ? 's' : ''} until {next}-day milestone
        </p>
      )}

      <button
        onClick={onReset}
        className="w-full mt-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg py-2 text-sm font-medium transition-colors"
      >
        Reset timer
      </button>
    </div>
  )
}
