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
        <h1 className="text-2xl font-bold text-white">Trigger Log</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Log urge
        </button>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Log urges, close calls, and moments that tested you. Over time this builds your personal toolkit.
      </p>

      {loading && <p className="text-slate-400">Loading…</p>}

      {!loading && triggers.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">📓</p>
          <p>No entries yet. Log your first trigger.</p>
        </div>
      )}

      <div className="space-y-3">
        {triggers.map(t => (
          <div key={t.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {t.trigger_category && (
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{t.trigger_category}</span>
                )}
                {t.emotional_state && (
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{t.emotional_state}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.resisted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {t.resisted ? 'Resisted ✓' : 'Relapsed'}
                </span>
              </div>
              <span className="text-slate-500 text-xs shrink-0 ml-2">{formatDate(t.created_at)}</span>
            </div>
            {t.description && <p className="text-slate-300 text-sm mt-2">{t.description}</p>}
            {t.resisted && t.what_helped && (
              <p className="text-green-400 text-xs mt-2">💡 {t.what_helped}</p>
            )}
          </div>
        ))}
      </div>

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Log an urge</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">What triggered it?</label>
              <select
                value={form.trigger_category}
                onChange={e => update('trigger_category', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select…</option>
                {TRIGGER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Emotional state</label>
              <select
                value={form.emotional_state}
                onChange={e => update('emotional_state', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select…</option>
                {EMOTIONAL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">What happened? (optional)</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={2}
                placeholder="Briefly describe the situation…"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Did you resist?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update('resisted', true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.resisted ? 'bg-green-600 text-white' : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Yes — close call
                </button>
                <button
                  type="button"
                  onClick={() => update('resisted', false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !form.resisted ? 'bg-red-600 text-white' : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  No — I relapsed
                </button>
              </div>
            </div>

            {form.resisted && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">What helped you resist?</label>
                <input
                  type="text"
                  value={form.what_helped}
                  onChange={e => update('what_helped', e.target.value)}
                  placeholder="Called a friend, went for a walk…"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
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
