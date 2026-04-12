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

function milestoneLabel(d) {
  if (d < 7) return `${d}d`
  if (d < 30) return `${d / 7}w`
  if (d < 365) return `${d / 30}mo`
  return '1yr'
}

function MilestoneTrack({ days }) {
  // Show milestones from 0 up to two ahead of current
  const nextIdx = MILESTONES_DAYS.findIndex(m => m > days)
  const endIdx = nextIdx === -1
    ? MILESTONES_DAYS.length - 1
    : Math.min(nextIdx + 1, MILESTONES_DAYS.length - 1)

  const trackEnd = MILESTONES_DAYS[endIdx]
  const pct = Math.min((days / trackEnd) * 100, 100)

  // Which milestones to show as markers
  const visible = MILESTONES_DAYS.slice(0, endIdx + 1)

  return (
    <div className="mt-6 px-1">
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Milestone journey</p>

      {/* Track */}
      <div className="relative">
        {/* Background rail */}
        <div className="h-2 bg-slate-700 rounded-full mx-2" />

        {/* Filled progress */}
        <div
          className="absolute top-0 left-2 h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
          style={{ width: `calc(${pct}% * (100% - 16px) / 100%)` }}
        />

        {/* Milestone markers */}
        {visible.map((m) => {
          const markerPct = (m / trackEnd) * 100
          const completed = days >= m
          const isNext = m === MILESTONES_DAYS[nextIdx]

          return (
            <div
              key={m}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `calc(8px + ${markerPct}% * (100% - 16px) / 100%)`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Marker dot */}
              <div className={`
                w-3.5 h-3.5 rounded-full border-2 transition-all z-10
                ${completed
                  ? 'bg-violet-500 border-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]'
                  : isNext
                  ? 'bg-slate-900 border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse'
                  : 'bg-slate-700 border-slate-600'}
              `} />

              {/* Label below */}
              <span className={`
                absolute top-4 text-xs font-medium whitespace-nowrap
                ${completed ? 'text-violet-400' : isNext ? 'text-indigo-400' : 'text-slate-600'}
              `}>
                {milestoneLabel(m)}
              </span>
            </div>
          )
        })}

        {/* Current position dot */}
        {days > 0 && pct < 99 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20"
            style={{ left: `calc(8px + ${pct}% * (100% - 16px) / 100%)`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-4 h-4 rounded-full bg-white border-2 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          </div>
        )}
      </div>

      {/* Next milestone callout */}
      {nextIdx !== -1 && (
        <div className="mt-7 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Day {days}</span>
          <span className="text-indigo-300 text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
            {MILESTONES_DAYS[nextIdx] - days} day{MILESTONES_DAYS[nextIdx] - days !== 1 ? 's' : ''} to {milestoneLabel(MILESTONES_DAYS[nextIdx])} milestone
          </span>
          <span className="text-slate-500 text-xs">Day {trackEnd}</span>
        </div>
      )}

      {nextIdx === -1 && (
        <p className="mt-7 text-center text-violet-400 text-xs font-medium">
          🏆 All milestones reached. You are extraordinary.
        </p>
      )}
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-slate-900/60 rounded-xl px-4 py-3 min-w-[64px]">
      <span className="text-3xl font-bold text-white font-mono tabular-nums leading-none">{value}</span>
      <span className="text-xs text-slate-500 mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function CounterCard({ timer, onReset, onArchive }) {
  const [elapsed, setElapsed] = useState(getElapsed(timer.started_at))

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(timer.started_at)), 1000)
    return () => clearInterval(id)
  }, [timer.started_at])

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/10 px-5 py-4 flex items-center justify-between border-b border-slate-700/60">
        <div>
          <h3 className="text-white font-semibold">{timer.addiction_name}</h3>
          <p className="text-indigo-300/70 text-xs mt-0.5">
            Since {new Date(timer.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={onArchive}
          className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          title="Archive timer"
        >
          ✕
        </button>
      </div>

      {/* Timer digits */}
      <div className="px-5 pt-5">
        <div className="flex gap-2 justify-center">
          <TimeUnit value={elapsed.days} label="days" />
          <div className="flex items-center pb-4 text-slate-600 font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.hours)} label="hrs" />
          <div className="flex items-center pb-4 text-slate-600 font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.minutes)} label="min" />
          <div className="flex items-center pb-4 text-slate-600 font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.seconds)} label="sec" />
        </div>

        {/* Milestone track */}
        <MilestoneTrack days={elapsed.days} />
      </div>

      {/* Reset button */}
      <div className="px-5 py-5">
        <button
          onClick={onReset}
          className="w-full border border-red-500/30 text-red-400/80 hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/5 rounded-xl py-2 text-sm font-medium transition-all"
        >
          Reset timer
        </button>
      </div>
    </div>
  )
}
