import { useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import { useApp } from '../context/AppContext'
import CounterCard from '../components/CounterCard'
import { MILESTONES_DAYS } from '../hooks/useTimer'

const ADDICTION_OPTIONS = [
  'Alcohol', 'Cannabis', 'Nicotine / Vaping', 'Cocaine', 'Opioids',
  'Methamphetamine', 'Gambling', 'Social Media', 'Pornography',
  'Shopping', 'Gaming', 'Food / Binge Eating', 'Caffeine',
  'Prescription Drugs', 'Other (custom)',
]

const TRIGGER_CATEGORIES = [
  'Stress', 'Boredom', 'Social Pressure', 'Physical Pain',
  'Emotional Pain', 'Relationship Issues', 'Work / School',
  'Financial Pressure', 'Celebration', 'Environmental Cue', 'Other',
]

const EMOTIONAL_STATES = [
  'Stressed', 'Anxious', 'Bored', 'Lonely', 'Angry', 'Sad',
  'Tired', 'Overwhelmed', 'Excited', 'Happy', 'Numb', 'Other',
]

function getElapsed(startedAt) {
  const diff = Date.now() - new Date(startedAt).getTime()
  return Math.floor(diff / 86400000)
}

export default function Timers() {
  const { timers, loading, addTimer, resetTimer, archiveTimer } = useTimer()
  const { showMilestone } = useApp()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [customName, setCustomName] = useState('')
  const [addingTimer, setAddingTimer] = useState(false)

  // Relapse post-mortem modal
  const [relapseTimer, setRelapseTimer] = useState(null)
  const [postMortem, setPostMortem] = useState({
    trigger_category: '',
    emotional_state: '',
    what_happened: '',
    need_being_met: '',
    next_time_plan: '',
  })
  const [submittingRelapse, setSubmittingRelapse] = useState(false)
  const [relapseSuccess, setRelapseSuccess] = useState(null) // days clean before

  async function handleAddTimer() {
    const name = newName === 'Other (custom)' ? customName.trim() : newName
    if (!name) return
    setAddingTimer(true)
    try {
      await addTimer(name)
      setShowAdd(false)
      setNewName('')
      setCustomName('')
    } finally {
      setAddingTimer(false)
    }
  }

  function openRelapse(timer) {
    setRelapseTimer(timer)
    setPostMortem({ trigger_category: '', emotional_state: '', what_happened: '', need_being_met: '', next_time_plan: '' })
    setRelapseSuccess(null)
  }

  async function handleResetConfirm() {
    if (!relapseTimer) return
    setSubmittingRelapse(true)
    try {
      const days = await resetTimer(relapseTimer.id, postMortem)
      setRelapseSuccess(days)
      // Check if new timer crosses a milestone immediately (rare, just in case)
    } finally {
      setSubmittingRelapse(false)
    }
  }

  // Milestone check — runs when timers update
  // (real milestone detection happens in useEffect in a real app; kept simple here)

  if (loading) {
    return <div className="p-8 text-slate-400">Loading…</div>
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Sobriety Timers</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add timer
        </button>
      </div>

      {timers.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">⏱️</p>
          <p>Add your first timer to start tracking.</p>
        </div>
      )}

      <div className="space-y-4">
        {timers.map(timer => (
          <CounterCard
            key={timer.id}
            timer={timer}
            onReset={() => openRelapse(timer)}
            onArchive={() => archiveTimer(timer.id)}
          />
        ))}
      </div>

      {/* Add timer modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">What are you tracking?</h2>
            <div className="space-y-3">
              <select
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select an addiction…</option>
                {ADDICTION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {newName === 'Other (custom)' && (
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Name it yourself…"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTimer}
                disabled={addingTimer || !newName || (newName === 'Other (custom)' && !customName.trim())}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {addingTimer ? 'Adding…' : 'Start timer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relapse post-mortem modal */}
      {relapseTimer && !relapseSuccess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-indigo-300 font-medium text-sm mb-1">Before you reset…</p>
            <h2 className="text-xl font-bold text-white mb-1">You were clean for</h2>
            <p className="text-4xl font-bold text-indigo-400 mb-4">
              {getElapsed(relapseTimer.started_at)} day{getElapsed(relapseTimer.started_at) !== 1 ? 's' : ''}
            </p>
            <p className="text-slate-400 text-sm mb-5">That still matters. Let&apos;s understand what happened so next time can be different.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">What triggered it?</label>
                <select
                  value={postMortem.trigger_category}
                  onChange={e => setPostMortem(p => ({ ...p, trigger_category: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select…</option>
                  {TRIGGER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">How were you feeling?</label>
                <select
                  value={postMortem.emotional_state}
                  onChange={e => setPostMortem(p => ({ ...p, emotional_state: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select…</option>
                  {EMOTIONAL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">What need were you trying to meet?</label>
                <input
                  type="text"
                  value={postMortem.need_being_met}
                  onChange={e => setPostMortem(p => ({ ...p, need_being_met: e.target.value }))}
                  placeholder="Comfort, escape, connection…"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">What could you try differently next time?</label>
                <textarea
                  value={postMortem.next_time_plan}
                  onChange={e => setPostMortem(p => ({ ...p, next_time_plan: e.target.value }))}
                  placeholder="Call someone, go for a walk…"
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRelapseTimer(null)}
                className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                disabled={submittingRelapse}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {submittingRelapse ? 'Saving…' : 'Reset & restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-relapse encouragement */}
      {relapseSuccess !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">💙</div>
            <h2 className="text-xl font-bold text-white mb-2">You were clean for {relapseSuccess} day{relapseSuccess !== 1 ? 's' : ''}.</h2>
            <p className="text-slate-300 mb-2">That still matters.</p>
            <p className="text-slate-400 text-sm mb-6">Your timer has been reset. The journey continues — and you know more about yourself than you did before.</p>
            <button
              onClick={() => { setRelapseTimer(null); setRelapseSuccess(null) }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Restart my journey
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
