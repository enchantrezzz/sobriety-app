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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 border border-indigo-500/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">{days}-Day Milestone!</h2>
        <p className="text-slate-300 text-sm mb-1 font-medium">{timerName}</p>
        <p className="text-indigo-300 mt-3 mb-6">{message}</p>
        <button
          onClick={dismissMilestone}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
