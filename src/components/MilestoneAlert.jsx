import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

const MILESTONE_MESSAGES = {
  1:   "One full day. That's real courage.",
  3:   'Three days clean. Your body is already healing.',
  7:   'One week. You did that.',
  14:  'Two weeks. The fog is lifting.',
  30:  'One month. You should be incredibly proud.',
  90:  'Three months. You are transforming your life.',
  180: 'Six months. Half a year of strength.',
  365: 'ONE YEAR. You are unstoppable.',
}

export default function MilestoneAlert() {
  const { milestoneAlert, dismissMilestone } = useApp()
  const btnRef = useRef(null)

  useEffect(() => {
    if (!milestoneAlert) return
    btnRef.current?.focus()
    function onKeyDown(e) {
      if (e.key === 'Escape') dismissMilestone()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [milestoneAlert, dismissMilestone])

  if (!milestoneAlert) return null

  const { timerName, days } = milestoneAlert
  const message = MILESTONE_MESSAGES[days] ?? `${days} days clean.`
  const titleId = 'milestone-title'

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={dismissMilestone}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-[#16181F] border border-[#C17A47]/25 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Trophy icon with glow */}
        <div className="w-16 h-16 rounded-full bg-[#C17A47]/15 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(193,122,71,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
            <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
          </svg>
        </div>

        <p className="text-[#8B8FA8] text-xs uppercase tracking-widest font-semibold mb-2">Milestone unlocked</p>
        <h2 id={titleId} className="text-3xl font-bold text-[#E8E8F0] mb-1">{days} days</h2>
        <p className="text-[#C17A47] text-sm font-semibold mb-1">{timerName}</p>
        <p className="text-[#B0B3C6] mt-3 mb-7 leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
          {message}
        </p>

        <button
          ref={btnRef}
          onClick={dismissMilestone}
          className="w-full bg-[#C17A47] hover:bg-[#A5622F] active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(193,122,71,0.35)] cursor-pointer"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
