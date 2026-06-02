import { useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import CounterCard from '../components/CounterCard'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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

function getElapsedDays(startedAt) {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 86400000)
}

function Steps({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
          i < current ? 'bg-[#C17A47]' : i === current ? 'bg-[#C17A47]/60' : 'bg-[#2A2D38]'
        }`} />
      ))}
    </div>
  )
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt === value ? '' : opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            value === opt
              ? 'bg-[#C17A47] text-white shadow-[0_0_10px_rgba(193,122,71,0.3)]'
              : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#C17A47]/40 hover:text-[#E8E8F0]'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function PostMortemModal({ timer, onConfirm, onCancel, submitting }) {
  const days = getElapsedDays(timer.started_at)
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    trigger_category: '', emotional_state: '',
    what_happened: '', need_being_met: '', next_time_plan: '',
  })

  const STEPS = [
    {
      content: (
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6BA6C9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <p className="text-[#6BA6C9] text-sm font-semibold mb-2">Before you reset…</p>
          <p className="text-[#E8E8F0] text-3xl font-bold mb-1">{days} day{days !== 1 ? 's' : ''} clean.</p>
          <p className="text-[#B0B3C6] text-base mt-3 leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            That still matters. Every day you made it was real.
          </p>
          <p className="text-[#8B8FA8] text-sm mt-3 leading-relaxed">
            A slip doesn&apos;t erase your progress — it&apos;s a data point. Let&apos;s understand what happened so next time can be different.
          </p>
        </div>
      ),
    },
    {
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[#E8E8F0] font-semibold mb-1">What triggered it?</p>
            <p className="text-[#8B8FA8] text-sm mb-3">What was happening right before?</p>
            <ChipGroup options={TRIGGER_CATEGORIES} value={data.trigger_category}
              onChange={v => setData(d => ({ ...d, trigger_category: v }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#B0B3C6] mb-2">
              Describe what happened <span className="text-[#8B8FA8] font-normal">(optional)</span>
            </label>
            <textarea value={data.what_happened} onChange={e => setData(d => ({ ...d, what_happened: e.target.value }))}
              placeholder="What was going on in your life at that moment?"
              rows={2}
              className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 resize-none transition-all" />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[#E8E8F0] font-semibold mb-1">How were you feeling?</p>
            <p className="text-[#8B8FA8] text-sm mb-3">Emotions right before it happened.</p>
            <ChipGroup options={EMOTIONAL_STATES} value={data.emotional_state}
              onChange={v => setData(d => ({ ...d, emotional_state: v }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#B0B3C6] mb-2">
              What need were you trying to meet? <span className="text-[#8B8FA8] font-normal">(optional)</span>
            </label>
            <input type="text" value={data.need_being_met}
              onChange={e => setData(d => ({ ...d, need_being_met: e.target.value }))}
              placeholder="Comfort, escape, connection, relief…"
              className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all" />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[#E8E8F0] font-semibold mb-1">What could you try differently?</p>
            <p className="text-[#8B8FA8] text-sm mb-3">One small thing you&apos;ll do differently when this feeling comes again.</p>
            <textarea value={data.next_time_plan} onChange={e => setData(d => ({ ...d, next_time_plan: e.target.value }))}
              placeholder="Call someone, go for a walk, drink water, wait 10 minutes…"
              rows={3}
              className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 resize-none transition-all" />
          </div>
          <div className="bg-[#C17A47]/8 border border-[#C17A47]/20 rounded-xl p-4">
            <p className="text-[#E8955A] text-sm leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
              You&apos;re not starting over. You&apos;re starting again — with more knowledge about yourself than you had before.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <Steps current={step} total={STEPS.length} />
        <div className="min-h-[260px]">{STEPS[step].content}</div>
        <div className="flex gap-3 mt-6">
          {step === 0 ? (
            <button onClick={onCancel}
              className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
              Cancel
            </button>
          ) : (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
              ← Back
            </button>
          )}
          {isLast ? (
            <button onClick={() => onConfirm(data)} disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
              {submitting ? 'Saving…' : 'Reset & restart'}
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-[#C17A47] hover:bg-[#A5622F] text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
              Continue →
            </button>
          )}
        </div>
        {step > 0 && !isLast && (
          <button onClick={() => setStep(STEPS.length - 1)}
            className="w-full mt-2 text-[#8B8FA8] hover:text-[#B0B3C6] text-xs py-1 transition-colors cursor-pointer">
            Skip to reset
          </button>
        )}
      </div>
    </div>
  )
}

function DeleteModal({ timer, onConfirm, onArchiveInstead, onCancel, deleting }) {
  const [step, setStep] = useState(onArchiveInstead ? 0 : 1)
  const [typed, setTyped] = useState('')
  const days = getElapsedDays(timer.started_at)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        {step === 0 && (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#E8E8F0] mb-2">Hold on.</h2>
              {days > 0 ? (
                <p className="text-[#B0B3C6] text-sm leading-relaxed">
                  You have <span className="text-[#C17A47] font-bold">{days} day{days !== 1 ? 's' : ''}</span> of progress on{' '}
                  <span className="text-[#E8E8F0] font-semibold">{timer.addiction_name}</span>. Deleting removes all of that history.
                </p>
              ) : (
                <p className="text-[#B0B3C6] text-sm leading-relaxed">
                  Deleting <span className="text-[#E8E8F0] font-semibold">{timer.addiction_name}</span> will permanently remove this timer and all its history.
                </p>
              )}
            </div>
            <div className="bg-[#C17A47]/8 border border-[#C17A47]/20 rounded-xl p-4 mb-5">
              <p className="text-[#E8955A] text-sm font-semibold mb-1">Consider archiving instead</p>
              <p className="text-[#8B8FA8] text-xs leading-relaxed">Archiving hides the timer without losing your history. You can restore it any time.</p>
            </div>
            <div className="space-y-2">
              <button onClick={onArchiveInstead}
                className="w-full bg-[#C17A47] hover:bg-[#A5622F] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-[0_2px_12px_rgba(193,122,71,0.25)] cursor-pointer">
                Archive instead
              </button>
              <button onClick={() => setStep(1)}
                className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                I still want to delete it
              </button>
              <button onClick={onCancel}
                className="w-full text-[#8B8FA8] hover:text-[#B0B3C6] py-2 text-sm transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#E8E8F0] mb-2">This is permanent.</h2>
              <p className="text-[#8B8FA8] text-sm leading-relaxed">
                All data for <span className="text-[#E8E8F0] font-semibold">{timer.addiction_name}</span> will be gone forever — including relapses and reflections. There is no undo.
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-sm text-[#8B8FA8] mb-2">
                Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm
              </label>
              <input type="text" value={typed} onChange={e => setTyped(e.target.value)}
                placeholder="DELETE" autoFocus
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 font-mono transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => onArchiveInstead ? (setStep(0), setTyped('')) : onCancel()}
                className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                {onArchiveInstead ? '← Go back' : 'Cancel'}
              </button>
              <button onClick={onConfirm} disabled={typed !== 'DELETE' || deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ArchiveModal({ timer, onConfirm, onCancel }) {
  const days = getElapsedDays(timer.started_at)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)] text-center">
        <div className="w-12 h-12 rounded-xl bg-[#C17A47]/10 border border-[#C17A47]/20 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9M10 13h4"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#E8E8F0] mb-2">Archive this timer?</h2>
        <p className="text-[#C17A47] text-sm font-semibold mb-1">{timer.addiction_name}</p>
        <p className="text-[#8B8FA8] text-sm mb-6">
          {days > 0
            ? `You were ${days} day${days !== 1 ? 's' : ''} clean. This timer will be hidden but your history is preserved.`
            : 'This timer will be hidden. Your history is preserved.'}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Keep it
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-[#C17A47] hover:bg-[#A5622F] text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Timers() {
  const { timers, loading, addTimer, resetTimer, archiveTimer, deleteTimer, fetchArchivedTimers, restoreTimer } = useTimer()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [customName, setCustomName] = useState('')
  const [startMode, setStartMode] = useState('now')
  const [customStart, setCustomStart] = useState('')
  const [addingTimer, setAddingTimer] = useState(false)

  const [relapseTimer, setRelapseTimer] = useState(null)
  const [submittingRelapse, setSubmittingRelapse] = useState(false)
  const [relapseSuccess, setRelapseSuccess] = useState(null)

  const [archiveTarget, setArchiveTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [showArchive, setShowArchive] = useState(false)
  const [archivedTimers, setArchivedTimers] = useState([])
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [archiveDeleteTarget, setArchiveDeleteTarget] = useState(null)
  const [archiveDeleting, setArchiveDeleting] = useState(false)

  async function toggleArchive() {
    if (showArchive) { setShowArchive(false); return }
    setArchiveLoading(true)
    const data = await fetchArchivedTimers()
    setArchivedTimers(data)
    setShowArchive(true)
    setArchiveLoading(false)
  }

  async function handleRestore(timerId) {
    setRestoringId(timerId)
    try {
      await restoreTimer(timerId)
      setArchivedTimers(prev => prev.filter(t => t.id !== timerId))
    } finally { setRestoringId(null) }
  }

  async function handleArchiveDelete() {
    if (!archiveDeleteTarget) return
    setArchiveDeleting(true)
    try {
      await deleteTimer(archiveDeleteTarget.id)
      setArchivedTimers(prev => prev.filter(t => t.id !== archiveDeleteTarget.id))
      setArchiveDeleteTarget(null)
    } finally { setArchiveDeleting(false) }
  }

  function nowLocal() {
    const d = new Date(); d.setSeconds(0, 0)
    return d.toISOString().slice(0, 16)
  }

  function openAdd() {
    setStartMode('now'); setCustomStart(nowLocal())
    setNewName(''); setCustomName(''); setShowAdd(true)
  }

  async function handleAddTimer() {
    const name = newName === 'Other (custom)' ? customName.trim() : newName
    if (!name) return
    setAddingTimer(true)
    try {
      const startedAt = startMode === 'custom' && customStart
        ? new Date(customStart).toISOString()
        : new Date().toISOString()
      await addTimer(name, startedAt)
      setShowAdd(false)
    } finally { setAddingTimer(false) }
  }

  async function handleResetConfirm(postMortem) {
    if (!relapseTimer) return
    setSubmittingRelapse(true)
    try {
      const days = await resetTimer(relapseTimer.id, postMortem)
      setRelapseSuccess(days)
    } finally { setSubmittingRelapse(false) }
  }

  if (loading) return <div className="p-8 text-[#8B8FA8]">Loading…</div>

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8F0]">Sobriety Timers</h1>
          <p className="text-[#8B8FA8] text-sm mt-0.5">Every second counts.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 bg-[#C17A47] hover:bg-[#A5622F] active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_2px_12px_rgba(193,122,71,0.35)] hover:shadow-[0_4px_20px_rgba(193,122,71,0.45)] cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add timer
        </button>
      </div>

      {/* Empty state */}
      {timers.length === 0 && (
        <div className="text-center py-16 text-[#8B8FA8]">
          <div className="w-16 h-16 rounded-2xl bg-[#1E2028] border border-[#2A2D38] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2.5h5M12 2.5V5"/>
            </svg>
          </div>
          <p>Add your first timer to start tracking.</p>
        </div>
      )}

      <div className="space-y-4">
        {timers.map(timer => (
          <CounterCard key={timer.id} timer={timer}
            onReset={() => { setRelapseTimer(timer); setRelapseSuccess(null) }}
            onArchive={() => setArchiveTarget(timer)}
            onDelete={() => setDeleteTarget(timer)} />
        ))}
      </div>

      {/* Add timer modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)] space-y-4">
            <h2 className="text-xl font-bold text-[#E8E8F0]">What are you tracking?</h2>
            <select value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all">
              <option value="">Select an addiction…</option>
              {ADDICTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {newName === 'Other (custom)' && (
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder="Name it yourself…"
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all" />
            )}
            <div>
              <label className="block text-sm font-semibold text-[#B0B3C6] mb-2">When did you start?</label>
              <div className="flex gap-2">
                {['now', 'custom'].map(mode => (
                  <button key={mode} type="button" onClick={() => setStartMode(mode)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      startMode === mode
                        ? 'bg-[#C17A47] text-white shadow-[0_2px_8px_rgba(193,122,71,0.3)]'
                        : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#333644] hover:text-[#E8E8F0]'
                    }`}>
                    {mode === 'now' ? 'Right now' : 'Pick a date'}
                  </button>
                ))}
              </div>
              {startMode === 'custom' && (
                <div className="mt-3">
                  <input type="datetime-local" value={customStart} max={nowLocal()}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all [color-scheme:dark]" />
                  {customStart && (
                    <p className="text-[#C17A47] text-xs mt-2">
                      That&apos;s {Math.floor((Date.now() - new Date(customStart).getTime()) / 86400000)} days ago
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddTimer}
                disabled={addingTimer || !newName || (newName === 'Other (custom)' && !customName.trim()) || (startMode === 'custom' && !customStart)}
                className="flex-1 bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
                {addingTimer ? 'Adding…' : 'Start timer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-mortem flow */}
      {relapseTimer && !relapseSuccess && (
        <PostMortemModal timer={relapseTimer} onConfirm={handleResetConfirm}
          onCancel={() => setRelapseTimer(null)} submitting={submittingRelapse} />
      )}

      {/* Post-relapse encouragement */}
      {relapseSuccess !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <div className="w-16 h-16 rounded-2xl bg-[#6DBF87]/10 border border-[#6DBF87]/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(109,191,135,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6DBF87" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#E8E8F0] mb-2">
              {relapseSuccess} day{relapseSuccess !== 1 ? 's' : ''} of courage.
            </h2>
            <p className="text-[#C17A47] font-semibold mb-3" style={{ fontFamily: 'Lora, Georgia, serif' }}>
              That wasn&apos;t nothing. That was real.
            </p>
            <p className="text-[#8B8FA8] text-sm mb-8 leading-relaxed">
              You now know yourself a little better. That knowledge is yours to keep. The clock resets — the growth doesn&apos;t.
            </p>
            <button onClick={() => { setRelapseTimer(null); setRelapseSuccess(null) }}
              className="w-full bg-[#C17A47] hover:bg-[#A5622F] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_2px_16px_rgba(193,122,71,0.3)] cursor-pointer">
              Begin again
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal timer={deleteTarget} deleting={deleting}
          onConfirm={async () => {
            setDeleting(true)
            try { await deleteTimer(deleteTarget.id); setDeleteTarget(null) }
            finally { setDeleting(false) }
          }}
          onArchiveInstead={() => { archiveTimer(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)} />
      )}
      {archiveTarget && (
        <ArchiveModal timer={archiveTarget}
          onConfirm={() => { archiveTimer(archiveTarget.id); setArchiveTarget(null) }}
          onCancel={() => setArchiveTarget(null)} />
      )}
      {archiveDeleteTarget && (
        <DeleteModal timer={archiveDeleteTarget} deleting={archiveDeleting}
          onConfirm={handleArchiveDelete} onArchiveInstead={null}
          onCancel={() => setArchiveDeleteTarget(null)} />
      )}

      {/* Archived timers section */}
      <div className="mt-10">
        <button onClick={toggleArchive}
          className="flex items-center gap-2 text-[#8B8FA8] hover:text-[#B0B3C6] text-sm transition-colors cursor-pointer">
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showArchive ? 'rotate-90' : ''}`} viewBox="0 0 14 14" fill="none">
            <path d="M4 2l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Archived timers</span>
          {archiveLoading && <span className="text-xs text-[#8B8FA8]">Loading…</span>}
        </button>

        {showArchive && (
          <div className="mt-3 space-y-2">
            {archivedTimers.length === 0 && (
              <p className="text-[#8B8FA8] text-sm px-1">No archived timers.</p>
            )}
            {archivedTimers.map(t => {
              const days = Math.floor((Date.now() - new Date(t.started_at).getTime()) / 86400000)
              return (
                <div key={t.id} className="flex items-center justify-between bg-[#16181F] border border-[#2A2D38] rounded-xl px-4 py-3 hover:border-[#333644] transition-colors">
                  <div>
                    <p className="text-[#B0B3C6] text-sm font-semibold">{t.addiction_name}</p>
                    <p className="text-[#8B8FA8] text-xs mt-0.5">
                      Started {formatDate(t.started_at)} · {days} day{days !== 1 ? 's' : ''} at archive
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRestore(t.id)} disabled={restoringId === t.id}
                      className="text-[#C17A47] hover:text-[#E8955A] disabled:opacity-50 text-xs font-bold border border-[#C17A47]/30 hover:border-[#C17A47]/60 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                      {restoringId === t.id ? 'Restoring…' : 'Restore'}
                    </button>
                    <button onClick={() => setArchiveDeleteTarget(t)}
                      className="text-[#8B8FA8] hover:text-red-400 border border-[#2A2D38] hover:border-red-500/30 p-1.5 rounded-lg transition-all cursor-pointer"
                      title="Delete permanently">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
