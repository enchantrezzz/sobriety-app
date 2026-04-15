import { useState } from 'react'
import { useTriggers } from '../hooks/useTriggers'
import { useTimer } from '../hooks/useTimer'

const SLICE_COLORS = [
  '#C17A47', // warm amber
  '#7C9B6E', // sage green
  '#C4956A', // warm peach
  '#A0786E', // warm rose
  '#8B7BA8', // soft purple
  '#6BA6A9', // teal
  '#C9845A', // terracotta
  '#9BAF82', // light sage
]

function GradientRingChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const total = data.reduce((s, d) => s + d.count, 0)

  const slices = data.map((d, i) => ({
    ...d,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
    pct: Math.round((d.count / total) * 100),
  }))

  // Full 360° ring: colors are evenly spaced around the full circle
  // regardless of segment size — purely decorative gradient.
  const colors = slices.map(s => s.color)
  const step = 360 / colors.length
  const stops = colors.map((c, i) => `${c} ${(i * step).toFixed(1)}deg`)
  stops.push(`${colors[0]} 360deg`)
  const gradient = `conic-gradient(from -90deg, ${stops.join(', ')})`

  const active = hovered !== null ? slices[hovered] : null

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Gradient ring */}
      <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
        <div
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        {/* Donut hole */}
        <div
          className="absolute rounded-full bg-[#FFFAF4] flex flex-col items-center justify-center gap-0.5"
          style={{ inset: '27%' }}
        >
          {active ? (
            <>
              <span className="text-xl font-bold text-[#3D2B1F] leading-none">{active.pct}%</span>
              <span className="text-[9px] text-[#8C7264] text-center leading-tight px-1 max-w-[70px] truncate">
                {active.category}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-[#3D2B1F] leading-none">{total}</span>
              <span className="text-[10px] text-[#8C7264]">total</span>
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
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[#5C4033] text-sm flex-1">{s.category}</span>
            <span className="text-[#8C7264] text-sm font-medium">{s.count}</span>
            <span className="text-xs font-semibold w-9 text-right" style={{ color: s.color }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Insights() {
  const { triggers, loading: triggersLoading, getTopTriggers, getResistanceRate } = useTriggers()
  const { timers, loading: timersLoading, getElapsed } = useTimer()

  if (triggersLoading || timersLoading) return <div className="p-8 text-[#8C7264]">Loading…</div>

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
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#3D2B1F]">Insights</h1>

      {/* Resistance rate */}
      {resistRate !== null && (
        <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)] text-center">
          <p className="text-[#8C7264] text-sm mb-2">Resistance rate</p>
          <p className="text-5xl font-bold text-[#C17A47]">{resistRate}%</p>
          <p className="text-[#8C7264] text-sm mt-2">of urges resisted ({triggers.length} total logged)</p>
        </div>
      )}

      {/* Top triggers pie chart */}
      <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
        <h2 className="text-lg font-semibold text-[#3D2B1F] mb-6">Top triggers</h2>
        {topTriggers.length === 0 ? (
          <p className="text-[#8C7264] text-sm">No triggers logged yet.</p>
        ) : (
          <GradientRingChart data={topTriggers} />
        )}
      </div>

      {/* Current streaks */}
      {streaks.length > 0 && (
        <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
          <h2 className="text-lg font-semibold text-[#3D2B1F] mb-4">Current streaks</h2>
          <div className="space-y-3">
            {streaks.map(({ name, days }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-[#5C4033] text-sm">{name}</span>
                <span className="text-[#C17A47] font-bold">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal toolkit */}
      {toolkit.length > 0 && (
        <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
          <h2 className="text-lg font-semibold text-[#3D2B1F] mb-2">Your personal toolkit</h2>
          <p className="text-[#8C7264] text-sm mb-4">Things that have helped you resist in the past.</p>
          <div className="space-y-2">
            {toolkit.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7C9B6E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-[#5C4033] text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {triggers.length === 0 && streaks.length === 0 && (
        <div className="text-center py-16 text-[#8C7264]">
          <div className="w-16 h-16 rounded-full bg-[#F5EDE0] flex items-center justify-center mx-auto mb-4">
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
