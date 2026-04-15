import { useEffect, useRef, useState } from 'react'
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

// ── Kebab menu ──────────────────────────────────────────────────
function KebabMenu({ onArchive, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A69080] hover:text-[#3D2B1F] hover:bg-[#F0E4D4] transition-colors cursor-pointer"
        title="Options"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-40 bg-[#FFFAF4] border border-[#E8D9C8] rounded-xl shadow-lg z-20 overflow-hidden">
          <button
            onClick={() => { onArchive(); setOpen(false) }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#5C4033] hover:bg-[#F5EDE0] hover:text-[#3D2B1F] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9M10 13h4"/>
            </svg>
            Archive
          </button>
          <div className="h-px bg-[#E8D9C8]" />
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ── Milestone track ─────────────────────────────────────────────
function MilestoneTrack({ days }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const nextIdx = MILESTONES_DAYS.findIndex(m => m > days)
  const allDone = nextIdx === -1
  const endIdx = allDone
    ? MILESTONES_DAYS.length - 1
    : Math.min(nextIdx + 1, MILESTONES_DAYS.length - 1)

  const trackEnd = MILESTONES_DAYS[endIdx]
  const pct = Math.min((days / trackEnd) * 100, 100)
  const visible = MILESTONES_DAYS.slice(0, endIdx + 1)

  const labelThreshold = 12
  const labeledMilestones = visible.filter((m, i, arr) => {
    if (i === 0) return true
    const prev = (arr[i - 1] / trackEnd) * 100
    const curr = (m / trackEnd) * 100
    return curr - prev >= labelThreshold
  })

  const daysToNext = allDone ? 0 : MILESTONES_DAYS[nextIdx] - days
  const pctToNext = allDone ? 100 : Math.round(pct)

  return (
    <div className="mt-6 px-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#A69080] uppercase tracking-wider">Milestone journey</p>
        {!allDone && (
          <span className="text-xs text-[#A69080] tabular-nums">{pctToNext}%</span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-2 mx-2">
        {/* Background */}
        <div className="absolute inset-0 bg-[#E8D9C8] rounded-full" />

        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: mounted ? `calc(${pct}% * (100% - 0px) / 100%)` : '0%',
            background: 'linear-gradient(to right, #C17A47, #D4956A)'
          }}
        />

        {/* Milestone dots */}
        {visible.map((m) => {
          const markerPct = (m / trackEnd) * 100
          const completed = days >= m
          const isNext = !allDone && m === MILESTONES_DAYS[nextIdx]
          const showLabel = labeledMilestones.includes(m)
          return (
            <div
              key={m}
              className="absolute top-1/2 flex flex-col items-center"
              style={{ left: `${markerPct}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`
                relative flex items-center justify-center rounded-full border-2 transition-all duration-500 z-10
                ${completed
                  ? 'w-4 h-4 bg-[#C17A47] border-[#D4956A] shadow-[0_0_8px_rgba(193,122,71,0.6)]'
                  : isNext
                  ? 'w-4 h-4 bg-[#FDF6EE] border-[#C17A47] shadow-[0_0_10px_rgba(193,122,71,0.5)] animate-pulse'
                  : 'w-3 h-3 bg-[#E8D9C8] border-[#DCC9B4]'}
              `}>
                {completed && (
                  <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {showLabel && (
                <span className={`
                  absolute top-[14px] text-[10px] font-medium whitespace-nowrap
                  ${completed ? 'text-[#C17A47]' : isNext ? 'text-[#C17A47]' : 'text-[#BEA898]'}
                `}>
                  {milestoneLabel(m)}
                </span>
              )}
            </div>
          )
        })}

        {/* Current position dot */}
        {days > 0 && pct < 99 && (
          <div
            className="absolute top-1/2 z-20 transition-all duration-1000 ease-out"
            style={{ left: mounted ? `${pct}%` : '0%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-4 h-4 rounded-full bg-[#FFFAF4] border-2 border-[#C17A47] shadow-[0_0_12px_rgba(193,122,71,0.8)]" />
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-8">
        {allDone ? (
          <div className="text-center space-y-1">
            <p className="text-[#C17A47] text-sm font-semibold">All milestones reached</p>
            <p className="text-[#A69080] text-xs">You are extraordinary. Keep going.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="text-center">
              <p className="text-[#3D2B1F] text-sm font-bold tabular-nums">{days}</p>
              <p className="text-[#A69080] text-[10px] uppercase tracking-wide">days</p>
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-[#C17A47] text-xs font-medium bg-[#C17A47]/10 border border-[#C17A47]/20 rounded-full px-3 py-1.5 text-center">
                {daysToNext} day{daysToNext !== 1 ? 's' : ''} to {milestoneLabel(MILESTONES_DAYS[nextIdx])}
              </span>
            </div>
            <div className="text-center">
              <p className="text-[#8C7264] text-sm font-bold tabular-nums">{trackEnd}</p>
              <p className="text-[#A69080] text-[10px] uppercase tracking-wide">goal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Time unit box ───────────────────────────────────────────────
function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-[#F0E4D4] rounded-xl px-4 py-3 min-w-[64px]">
      <span className="text-3xl font-bold text-[#3D2B1F] font-mono tabular-nums leading-none">{value}</span>
      <span className="text-xs text-[#A69080] mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

// ── Card ────────────────────────────────────────────────────────
export default function CounterCard({ timer, onReset, onArchive, onDelete }) {
  const [elapsed, setElapsed] = useState(getElapsed(timer.started_at))

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(timer.started_at)), 1000)
    return () => clearInterval(id)
  }, [timer.started_at])

  return (
    <div className="bg-[#FFFAF4] rounded-2xl border border-[#E8D9C8] overflow-hidden shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C17A47]/10 to-[#F5EDE0] px-5 py-4 flex items-center justify-between border-b border-[#E8D9C8]">
        <div>
          <h3 className="text-[#3D2B1F] font-semibold">{timer.addiction_name}</h3>
          <p className="text-[#C17A47]/80 text-xs mt-0.5">
            Since {new Date(timer.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <KebabMenu onArchive={onArchive} onDelete={onDelete} />
      </div>

      {/* Timer digits */}
      <div className="px-5 pt-5">
        <div className="flex gap-2 justify-center">
          <TimeUnit value={elapsed.days} label="days" />
          <div className="flex items-center pb-4 text-[#DCC9B4] font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.hours)} label="hrs" />
          <div className="flex items-center pb-4 text-[#DCC9B4] font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.minutes)} label="min" />
          <div className="flex items-center pb-4 text-[#DCC9B4] font-bold text-xl">:</div>
          <TimeUnit value={pad(elapsed.seconds)} label="sec" />
        </div>

        <MilestoneTrack days={elapsed.days} />
      </div>

      {/* Reset button */}
      <div className="px-5 py-5">
        <button
          onClick={onReset}
          className="w-full border border-red-300 text-red-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl py-2 text-sm font-medium transition-all cursor-pointer"
        >
          Reset timer
        </button>
      </div>
    </div>
  )
}
