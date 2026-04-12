import { useState } from 'react'
import { useTriggers } from '../hooks/useTriggers'
import { useTimer } from '../hooks/useTimer'

const SLICE_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
]

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle)
  const e = polarToCartesian(cx, cy, r, endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
}

function PieChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const total = data.reduce((s, d) => s + d.count, 0)
  const cx = 110
  const cy = 110
  const r = 90
  const rInner = 48 // donut hole

  let angle = 0
  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 360
    const start = angle
    const end = angle + sweep
    angle += sweep
    return { ...d, start, end, color: SLICE_COLORS[i % SLICE_COLORS.length], pct: Math.round((d.count / total) * 100) }
  })

  // Label position — midpoint of arc, pushed out slightly
  function labelPos(start, end) {
    const mid = (start + end) / 2
    return polarToCartesian(cx, cy, r * 0.68, mid)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* SVG chart */}
      <div className="relative shrink-0">
        <svg width={220} height={220} className="overflow-visible">
          {slices.map((s, i) => (
            <path
              key={i}
              d={slicePath(cx, cy, r, s.start, s.end)}
              fill={s.color}
              stroke="#1e293b"
              strokeWidth={2}
              opacity={hovered === null || hovered === i ? 1 : 0.4}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s, transform 0.15s', transformOrigin: `${cx}px ${cy}px`, transform: hovered === i ? 'scale(1.06)' : 'scale(1)' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Donut hole */}
          <circle cx={cx} cy={cy} r={rInner} fill="#1e293b" />

          {/* Centre text — shows hovered slice or total */}
          {hovered !== null ? (
            <>
              <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={22} fontWeight="bold">
                {slices[hovered].pct}%
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                {slices[hovered].category}
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={22} fontWeight="bold">
                {total}
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                total
              </text>
            </>
          )}

          {/* Percentage labels on slices (only if slice is big enough) */}
          {slices.map((s, i) => {
            if (s.pct < 8) return null
            const pos = labelPos(s.start, s.end)
            return (
              <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight="600" style={{ pointerEvents: 'none' }}>
                {s.pct}%
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full">
        {slices.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.4, transition: 'opacity 0.15s' }}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-300 text-sm flex-1">{s.category}</span>
            <span className="text-slate-400 text-sm font-medium">{s.count}</span>
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

  if (triggersLoading || timersLoading) return <div className="p-8 text-slate-400">Loading…</div>

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
      <h1 className="text-2xl font-bold text-white">Insights</h1>

      {/* Resistance rate */}
      {resistRate !== null && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm mb-2">Resistance rate</p>
          <p className="text-5xl font-bold text-indigo-400">{resistRate}%</p>
          <p className="text-slate-400 text-sm mt-2">of urges resisted ({triggers.length} total logged)</p>
        </div>
      )}

      {/* Top triggers pie chart */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-6">Top triggers</h2>
        {topTriggers.length === 0 ? (
          <p className="text-slate-400 text-sm">No triggers logged yet.</p>
        ) : (
          <PieChart data={topTriggers} />
        )}
      </div>

      {/* Current streaks */}
      {streaks.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Current streaks</h2>
          <div className="space-y-3">
            {streaks.map(({ name, days }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">{name}</span>
                <span className="text-indigo-400 font-bold">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal toolkit */}
      {toolkit.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-2">Your personal toolkit</h2>
          <p className="text-slate-400 text-sm mb-4">Things that have helped you resist in the past.</p>
          <div className="space-y-2">
            {toolkit.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {triggers.length === 0 && streaks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">📊</p>
          <p>Insights will appear as you log triggers and build streaks.</p>
        </div>
      )}
    </div>
  )
}
