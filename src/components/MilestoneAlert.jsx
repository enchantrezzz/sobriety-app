import { useApp } from '../context/AppContext'

const MILESTONE_MESSAGES = {
  1: "One full day! That's real courage.",
  3: 'Three days clean. Your body is already healing.',
  7: 'One week! You did that.',
  14: 'Two weeks. The fog is lifting.',
  30: 'One month. You should be incredibly proud.',
  90: 'Three months. You are transforming your life.',
  180: 'Six months. Half a year of strength.',
  365: 'ONE YEAR. You are unstoppable.',
}

export default function MilestoneAlert() {
  const { milestoneAlert, dismissMilestone } = useApp()
  if (!milestoneAlert) return null

  const { timerName, days } = milestoneAlert
  const message = MILESTONE_MESSAGES[days] ?? `${days} days clean!`

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-[#FFFAF4] border border-[#C17A47]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3D2B1F] mb-2">{days}-Day Milestone!</h2>
        <p className="text-[#5C4033] text-sm mb-1 font-medium">{timerName}</p>
        <p className="text-[#C17A47] mt-3 mb-6" style={{ fontFamily: 'Lora, Georgia, serif' }}>{message}</p>
        <button
          onClick={dismissMilestone}
          className="bg-[#C17A47] hover:bg-[#A5622F] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
