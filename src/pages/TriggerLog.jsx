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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3D2B1F]">Trigger Log</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#C17A47] hover:bg-[#A5622F] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          + Log urge
        </button>
      </div>

      <p className="text-[#8C7264] text-sm mb-6">
        Log urges, close calls, and moments that tested you. Over time this builds your personal toolkit.
      </p>

      {loading && <p className="text-[#8C7264]">Loading…</p>}

      {!loading && triggers.length === 0 && (
        <div className="text-center py-16 text-[#8C7264]">
          <div className="w-16 h-16 rounded-full bg-[#F5EDE0] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
            </svg>
          </div>
          <p>No entries yet. Log your first trigger.</p>
        </div>
      )}

      <div className="space-y-3">
        {triggers.map(t => (
          <div key={t.id} className="bg-[#FFFAF4] rounded-xl p-4 border border-[#E8D9C8] shadow-[0_1px_6px_rgba(139,90,43,0.05)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {t.trigger_category && (
                  <span className="bg-[#F5EDE0] text-[#5C4033] text-xs px-2 py-0.5 rounded-full">{t.trigger_category}</span>
                )}
                {t.emotional_state && (
                  <span className="bg-[#F5EDE0] text-[#5C4033] text-xs px-2 py-0.5 rounded-full">{t.emotional_state}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.resisted ? 'bg-[#EEF5EB] text-[#5A8050]' : 'bg-red-50 text-red-500'
                }`}>
                  {t.resisted ? 'Resisted ✓' : 'Relapsed'}
                </span>
              </div>
              <span className="text-[#A69080] text-xs shrink-0 ml-2">{formatDate(t.created_at)}</span>
            </div>
            {t.description && <p className="text-[#5C4033] text-sm mt-2">{t.description}</p>}
            {t.resisted && t.what_helped && (
              <p className="text-[#5A8050] text-xs mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {t.what_helped}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <form
            onSubmit={handleSubmit}
            className="bg-[#FFFAF4] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8D9C8] space-y-4"
          >
            <h2 className="text-xl font-bold text-[#3D2B1F]">Log an urge</h2>

            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-1">What triggered it?</label>
              <select
                value={form.trigger_category}
                onChange={e => update('trigger_category', e.target.value)}
                className="w-full bg-[#F5EDE0] border border-[#DCC9B4] rounded-lg px-3 py-2 text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47]"
              >
                <option value="">Select…</option>
                {TRIGGER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-1">Emotional state</label>
              <select
                value={form.emotional_state}
                onChange={e => update('emotional_state', e.target.value)}
                className="w-full bg-[#F5EDE0] border border-[#DCC9B4] rounded-lg px-3 py-2 text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47]"
              >
                <option value="">Select…</option>
                {EMOTIONAL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-1">What happened? (optional)</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={2}
                placeholder="Briefly describe the situation…"
                className="w-full bg-[#F5EDE0] border border-[#DCC9B4] rounded-lg px-3 py-2 text-[#3D2B1F] text-sm placeholder-[#A69080] focus:outline-none focus:ring-2 focus:ring-[#C17A47] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-2">Did you resist?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update('resisted', true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    form.resisted ? 'bg-[#7C9B6E] text-white' : 'border border-[#DCC9B4] text-[#5C4033] hover:bg-[#F5EDE0]'
                  }`}
                >
                  Yes — close call
                </button>
                <button
                  type="button"
                  onClick={() => update('resisted', false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    !form.resisted ? 'bg-red-500 text-white' : 'border border-[#DCC9B4] text-[#5C4033] hover:bg-[#F5EDE0]'
                  }`}
                >
                  No — I relapsed
                </button>
              </div>
            </div>

            {form.resisted && (
              <div>
                <label className="block text-sm font-medium text-[#5C4033] mb-1">What helped you resist?</label>
                <input
                  type="text"
                  value={form.what_helped}
                  onChange={e => update('what_helped', e.target.value)}
                  placeholder="Called a friend, went for a walk…"
                  className="w-full bg-[#F5EDE0] border border-[#DCC9B4] rounded-lg px-3 py-2 text-[#3D2B1F] text-sm placeholder-[#A69080] focus:outline-none focus:ring-2 focus:ring-[#C17A47]"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-[#DCC9B4] text-[#5C4033] hover:bg-[#F5EDE0] py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors cursor-pointer"
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
