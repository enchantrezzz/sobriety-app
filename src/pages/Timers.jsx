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
