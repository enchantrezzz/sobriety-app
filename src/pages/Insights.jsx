import { useState } from 'react'
import { useTriggers } from '../hooks/useTriggers'
import { useTimer } from '../hooks/useTimer'

const SLICE_COLORS = [
  '#C17A47',
  '#6DBF87',
  '#E8955A',
  '#8B7BA8',
  '#6BA6A9',
  '#C9845A',
  '#9BAF82',
  '#A0786E',
]

function GradientRingChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const total = data.reduce((s, d) => s + d.count, 0)

  const slices = data.map((d, i) => ({
    ...d,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
    pct: Math.round((d.count / total) * 100),
  }))

  const colors = slices.map(s => s.color)
  const step = 360 / colors.length
  const stops = colors.map((c, i) => `${c} ${(i * step).toFixed(1)}deg`)
  stops.push(`${colors[0]} 360deg`)
  const gradient = `conic-gradient(from -90deg, ${stops.join(', ')})`

  const active = hovered !== null ? slices[hovered] : null

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Ring */}
      <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        {/* Donut hole */}
        <div
          className="absolute rounded-full bg-[#16181F] flex flex-col items-center justify-center gap-0.5"
          style={{ inset: '27%' }}
        >
          {active ? (
            <>
              <span className="text-xl font-bold text-[#E8E8F0] leading-none">{active.pct}%</span>
              <span className="text-[9px] text-[#8B8FA8] text-center leading-tight px-1 max-w-[70px] truncate">
                {active.category}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-[#E8E8F0] leading-none">{total}</span>
              <span className="text-[10px] text-[#8B8FA8]">total</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full">
        {slices.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 cursor-pointer transition-opacity duration-150"
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.3 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[#B0B3C6] text-sm flex-1">{s.category}</span>
            <span className="text-[#8B8FA8] text-sm font-medium tabular-nums">{s.count}</span>
            <span className="text-xs font-bold w-9 text-right tabular-nums" style={{ color: s.color }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, children }) {
  return (
    <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {children}
    </div>
  )
}

export default function Insights() {
  const { triggers, loading: triggersLoading, getTopTriggers, getResistanceRate } = useTriggers()
  const { timers, loading: timersLoading, getElapsed } = useTimer()

  if (triggersLoading || timersLoading) {
    return <div className="p-8 text-[#8B8FA8]">Loading…</div>
  }

  const topTriggers = getTopTriggers(8)
  const resistRate = getResistanceRate()

  const toolkit = [...new Set(
    triggers.filter(t => t.resisted && t.what_helped).map(t => t.what_helped)
  )].slice(0, 6)

  const streaks = timers.map(t => ({
    name: t.addiction_name,
    days: getElapsed(t.started_at).days,
  }))

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#E8E8F0]">Insights</h1>

      {/* Resistance rate */}
      {resistRate !== null && (
        <StatCard>
          <p className="text-[#8B8FA8] text-xs uppercase tracking-widest font-semibold mb-3">Resistance rate</p>
          <p className="text-6xl font-bold text-[#C17A47] leading-none mb-2">{resistRate}%</p>
          <p className="text-[#8B8FA8] text-sm">of urges resisted · {triggers.length} total logged</p>
        </StatCard>
      )}

      {/* Top triggers chart */}
      <StatCard>
        <h2 className="text-base font-semibold text-[#E8E8F0] mb-6">Top triggers</h2>
        {topTriggers.length === 0 ? (
          <p className="text-[#8B8FA8] text-sm">No triggers logged yet.</p>
        ) : (
          <GradientRingChart data={topTriggers} />
        )}
      </StatCard>

      {/* Current streaks */}
      {streaks.length > 0 && (
        <StatCard>
          <h2 className="text-base font-semibold text-[#E8E8F0] mb-4">Current streaks</h2>
          <div className="space-y-3">
            {streaks.map(({ name, days }) => (
              <div key={name} className="flex items-center justify-between py-1">
                <span className="text-[#B0B3C6] text-sm">{name}</span>
                <span className="text-[#C17A47] font-bold tabular-nums">
                  {days} day{days !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </StatCard>
      )}

      {/* Personal toolkit */}
      {toolkit.length > 0 && (
        <StatCard>
          <h2 className="text-base font-semibold text-[#E8E8F0] mb-1">Your personal toolkit</h2>
          <p className="text-[#8B8FA8] text-xs mb-4">Things that have helped you resist in the past.</p>
          <div className="space-y-2.5">
            {toolkit.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#6DBF87]/15 border border-[#6DBF87]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#6DBF87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#B0B3C6] text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </StatCard>
      )}

      {triggers.length === 0 && streaks.length === 0 && (
        <div className="text-center py-16 text-[#8B8FA8]">
          <div className="w-16 h-16 rounded-2xl bg-[#1E2028] border border-[#2A2D38] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <p>Insights will appear as you log triggers and build streaks.</p>
        </div>
      )}
    </div>
  )
}
