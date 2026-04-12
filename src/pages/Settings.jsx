import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tone, setTone] = useState(profile?.motivational_tone ?? 'gentle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({ motivational_tone: tone }).eq('id', user.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Motivational tone</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTone('gentle')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                tone === 'gentle'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌿 Gentle
              <p className="text-xs font-normal mt-0.5 opacity-70">Warm & supportive</p>
            </button>
            <button
              onClick={() => setTone('tough')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                tone === 'tough'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              💪 Tough Love
              <p className="text-xs font-normal mt-0.5 opacity-70">Honest & direct</p>
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          className="w-full border border-red-500/40 text-red-400 hover:bg-red-500/10 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
