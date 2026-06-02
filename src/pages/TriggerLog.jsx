import { useState } from 'react'
import { useTriggers, TRIGGER_CATEGORIES, EMOTIONAL_STATES } from '../hooks/useTriggers'

export default function TriggerLog() {
  const { triggers, loading, logTrigger } = useTriggers()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    trigger_category: '',
    emotional_state: '',
    description: '',
    resisted: true,
    what_helped: '',
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await logTrigger(form)
      setShowForm(false)
      setForm({ trigger_category: '', emotional_state: '', description: '', resisted: true, what_helped: '' })
    } finally {
      setSaving(false)
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-[#E8E8F0]">Trigger Log</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-[#C17A47] hover:bg-[#A5622F] active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_2px_12px_rgba(193,122,71,0.3)] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Log urge
        </button>
      </div>

      <p className="text-[#8B8FA8] text-sm mb-6">
        Log urges, close calls, and moments that tested you. Over time this builds your personal toolkit.
      </p>

      {loading && <p className="text-[#8B8FA8]">Loading…</p>}

      {!loading && triggers.length === 0 && (
        <div className="text-center py-16 text-[#8B8FA8]">
          <div className="w-16 h-16 rounded-2xl bg-[#1E2028] border border-[#2A2D38] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M7 8h10M7 12h10M7 16h6"/>
            </svg>
          </div>
          <p>No entries yet. Log your first trigger.</p>
        </div>
      )}

      <div className="space-y-3">
        {triggers.map(t => (
          <div key={t.id} className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-4 hover:border-[#333644] transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {t.trigger_category && (
                  <span className="bg-[#1E2028] border border-[#2A2D38] text-[#B0B3C6] text-xs px-2.5 py-1 rounded-full">
                    {t.trigger_category}
                  </span>
                )}
                {t.emotional_state && (
                  <span className="bg-[#1E2028] border border-[#2A2D38] text-[#B0B3C6] text-xs px-2.5 py-1 rounded-full">
                    {t.emotional_state}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  t.resisted
                    ? 'bg-[#6DBF87]/10 border-[#6DBF87]/25 text-[#6DBF87]'
                    : 'bg-red-500/10 border-red-500/25 text-red-400'
                }`}>
                  {t.resisted ? 'Resisted ✓' : 'Relapsed'}
                </span>
              </div>
              <span className="text-[#8B8FA8] text-xs shrink-0">{formatDate(t.created_at)}</span>
            </div>
            {t.description && (
              <p className="text-[#B0B3C6] text-sm mt-3 leading-relaxed">{t.description}</p>
            )}
            {t.resisted && t.what_helped && (
              <p className="text-[#6DBF87] text-xs mt-2.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t.what_helped}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <form
            onSubmit={handleSubmit}
            className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)] space-y-4"
          >
            <h2 className="text-xl font-bold text-[#E8E8F0]">Log an urge</h2>

            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">What triggered it?</label>
              <select
                value={form.trigger_category}
                onChange={e => update('trigger_category', e.target.value)}
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
              >
                <option value="">Select…</option>
                {TRIGGER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">Emotional state</label>
              <select
                value={form.emotional_state}
                onChange={e => update('emotional_state', e.target.value)}
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
              >
                <option value="">Select…</option>
                {EMOTIONAL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">
                What happened? <span className="text-[#8B8FA8] font-normal">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={2}
                placeholder="Briefly describe the situation…"
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-2">Did you resist?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update('resisted', true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    form.resisted
                      ? 'bg-[#6DBF87]/20 border border-[#6DBF87]/40 text-[#6DBF87]'
                      : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#333644] hover:text-[#E8E8F0]'
                  }`}
                >
                  Yes — close call
                </button>
                <button
                  type="button"
                  onClick={() => update('resisted', false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    !form.resisted
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#333644] hover:text-[#E8E8F0]'
                  }`}
                >
                  No — I relapsed
                </button>
              </div>
            </div>

            {form.resisted && (
              <div>
                <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">What helped you resist?</label>
                <input
                  type="text"
                  value={form.what_helped}
                  onChange={e => update('what_helped', e.target.value)}
                  placeholder="Called a friend, went for a walk…"
                  className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-3 py-2.5 text-[#E8E8F0] text-sm placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-[#1E2028] border border-[#2A2D38] hover:border-[#333644] text-[#B0B3C6] hover:text-[#E8E8F0] py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                {saving ? 'Saving…' : 'Log it'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
