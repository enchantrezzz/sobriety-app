import { useEffect, useRef, useState } from 'react'
import { MILESTONES_DAYS } from '../hooks/useTimer'
import { useApp } from '../context/AppContext'
import {
  getCrossedMilestones,
  markMilestoneShown,
  wasMilestoneShown,
} from '../utils/milestones'

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

function getLatestMilestoneReached(days) {
  const reached = MILESTONES_DAYS.filter(m => m <= days)
  return reached.length ? reached[reached.length - 1] : null
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
        <div className="absolute right-0 top-9 w-40 surface-bg border border-subtle rounded-xl shadow-lg z-20 overflow-hidden">
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
    <div className="mt-5 px-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-[#A69080] uppercase tracking-widest font-semibold">Progress</p>
        {!allDone && (
          <span className="text-[10px] text-[#C17A47] font-bold tabular-nums">{pctToNext}%</span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-2.5 mx-2">
        {/* Background */}
        <div className="absolute inset-0 bg-[#EDE0D0] rounded-full" />

        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: mounted ? `calc(${pct}% * (100% - 0px) / 100%)` : '0%',
            background: 'linear-gradient(to right, #C17A47, #E8A87C)'
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
                relative flex items-center justify-center rounded-full transition-all duration-500 z-10
                ${completed
                  ? 'w-3.5 h-3.5 bg-[#C17A47] shadow-[0_0_8px_rgba(193,122,71,0.7)]'
                  : isNext
                  ? 'w-3.5 h-3.5 bg-white border-2 border-[#C17A47] shadow-[0_0_10px_rgba(193,122,71,0.5)] animate-pulse'
                  : 'w-2.5 h-2.5 bg-[#E8D9C8] border border-[#DCC9B4]'}
              `}>
                {completed && (
                  <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {showLabel && (
                <span className={`
                  absolute top-[14px] text-[10px] font-semibold whitespace-nowrap
                  ${completed ? 'text-[#C17A47]' : isNext ? 'text-[#C17A47]' : 'text-[#C8B8A8]'}
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
            <div className="w-4 h-4 rounded-full bg-white border-2 border-[#C17A47] shadow-[0_0_14px_rgba(193,122,71,0.9)]" />
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-8">
        {allDone ? (
          <div className="text-center space-y-1">
            <p className="text-[#C17A47] text-sm font-bold">All milestones reached ✦</p>
            <p className="text-[#A69080] text-xs">You are extraordinary. Keep going.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-left min-w-[32px]">
              <p className="text-[#3D2B1F] text-sm font-bold tabular-nums">{days}</p>
              <p className="text-[#A69080] text-[10px] uppercase tracking-wide">days</p>
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-[#C17A47] text-xs font-semibold bg-[#C17A47]/10 border border-[#C17A47]/20 rounded-full px-3 py-1 text-center whitespace-nowrap">
                {daysToNext}d to {milestoneLabel(MILESTONES_DAYS[nextIdx])}
              </span>
            </div>
            <div className="text-right min-w-[32px]">
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
function TimeUnit({ value, label, highlight }) {
  return (
    <div className={`
      flex flex-col items-center rounded-2xl px-3 py-3 min-w-[60px] relative overflow-hidden
      transition-all duration-300
      ${highlight
        ? 'bg-gradient-to-b from-[#C17A47] to-[#A5622F] shadow-[0_4px_20px_rgba(193,122,71,0.45)]'
        : 'bg-[#F5EDE0] border border-[#E8D9C8]'}
    `}>
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}
      <span className={`
        text-3xl font-bold font-mono tabular-nums leading-none tracking-tight
        ${highlight ? 'text-white' : 'text-[#3D2B1F]'}
      `}>{value}</span>
      <span className={`
        text-[10px] mt-1.5 uppercase tracking-widest font-semibold
        ${highlight ? 'text-orange-100' : 'text-[#A69080]'}
      `}>{label}</span>
    </div>
  )
}

// ── Card ────────────────────────────────────────────────────────
export default function CounterCard({ timer, onReset, onArchive, onDelete }) {
  const { showMilestone } = useApp()
  const [elapsed, setElapsed] = useState(getElapsed(timer.started_at))
  const previousDaysRef = useRef(elapsed.days)

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(timer.started_at)), 1000)
    return () => clearInterval(id)
  }, [timer.started_at])

  useEffect(() => {
    const previousDays = previousDaysRef.current
    const currentDays = elapsed.days
    previousDaysRef.current = currentDays

    if (currentDays <= previousDays) return

    if (typeof window === 'undefined') return

    const crossedMilestones = getCrossedMilestones(previousDays, currentDays, MILESTONES_DAYS)
    if (crossedMilestones.length === 0) return

    const milestoneToShow = crossedMilestones[crossedMilestones.length - 1]
    if (wasMilestoneShown(window.localStorage, timer.id, timer.started_at, milestoneToShow)) return

    markMilestoneShown(window.localStorage, timer.id, timer.started_at, milestoneToShow)
    showMilestone(timer.addiction_name, milestoneToShow)
  }, [elapsed.days, showMilestone, timer.addiction_name, timer.id, timer.started_at])

  const latestMilestoneReached = getLatestMilestoneReached(elapsed.days)

  return (
    <div className="card overflow-hidden shadow-[0_4px_24px_rgba(139,90,43,0.10)] hover:shadow-[0_8px_32px_rgba(139,90,43,0.15)] transition-shadow duration-300">
      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 flex items-start justify-between">
        {/* Subtle warm glow in top-right */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C17A47]/8 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-0.5">
            {/* Live indicator dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C17A47] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C17A47]" />
            </span>
            <h3 className="text-[#3D2B1F] font-bold text-base">{timer.addiction_name}</h3>
          </div>
          <p className="text-[#A69080] text-xs pl-4">
            Since {new Date(timer.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {latestMilestoneReached && (
            <span className="mt-2.5 ml-4 inline-flex items-center gap-1 text-[11px] font-bold text-[#C17A47] bg-[#C17A47]/10 border border-[#C17A47]/25 rounded-full px-2.5 py-1">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" fill="currentColor"/>
              </svg>
              {milestoneLabel(latestMilestoneReached)} milestone
            </span>
          )}
        </div>
        <div className="relative">
          <KebabMenu onArchive={onArchive} onDelete={onDelete} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#E8D9C8] to-transparent" />

      {/* Timer digits */}
      <div className="px-5 pt-5 pb-1">
        <div className="flex gap-2 justify-center items-end">
          <TimeUnit value={elapsed.days} label="days" highlight />
          <div className="flex items-center mb-[18px] text-[#C17A47]/40 font-bold text-lg select-none">:</div>
          <TimeUnit value={pad(elapsed.hours)} label="hrs" />
          <div className="flex items-center mb-[18px] text-[#DCC9B4] font-bold text-lg select-none">:</div>
          <TimeUnit value={pad(elapsed.minutes)} label="min" />
          <div className="flex items-center mb-[18px] text-[#DCC9B4] font-bold text-lg select-none">:</div>
          <TimeUnit value={pad(elapsed.seconds)} label="sec" />
        </div>

        <MilestoneTrack days={elapsed.days} />
      </div>

      {/* Reset button */}
      <div className="px-5 pb-5 pt-1">
        <button
          onClick={onReset}
          className="w-full group flex items-center justify-center gap-1.5 border border-[#E8D9C8] hover:border-red-300 text-[#A69080] hover:text-red-500 hover:bg-red-50/60 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 7a5 5 0 1 0 1.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 3.5V7h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Log a relapse
        </button>
      </div>
    </div>
  )
}
