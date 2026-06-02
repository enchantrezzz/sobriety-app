import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, profile, signOut, updateProfileTone } = useAuth()
  const navigate = useNavigate()
  const [tone, setTone] = useState(profile?.motivational_tone ?? 'gentle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ motivational_tone: tone }).eq('id', user.id)
    if (!error) {
      updateProfileTone(tone)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#E8E8F0]">Settings</h1>

      {/* Preferences card */}
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] space-y-6">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[#8B8FA8] uppercase tracking-widest mb-1">Email</label>
          <p className="text-[#B0B3C6] text-sm">{user?.email}</p>
        </div>

        <div className="h-px bg-[#2A2D38]" />

        {/* Motivational tone */}
        <div>
          <label className="block text-sm font-semibold text-[#E8E8F0] mb-1">Motivational tone</label>
          <p className="text-[#8B8FA8] text-xs mb-4">Controls the style of your daily message.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setTone('gentle')}
              className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                tone === 'gentle'
                  ? 'bg-[#C17A47] text-white shadow-[0_4px_16px_rgba(193,122,71,0.35)]'
                  : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#333644] hover:text-[#E8E8F0]'
              }`}
            >
              Gentle
              <p className="text-xs font-normal mt-0.5 opacity-70">Warm &amp; supportive</p>
            </button>
            <button
              onClick={() => setTone('tough')}
              className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                tone === 'tough'
                  ? 'bg-[#C17A47] text-white shadow-[0_4px_16px_rgba(193,122,71,0.35)]'
                  : 'bg-[#1E2028] border border-[#2A2D38] text-[#8B8FA8] hover:border-[#333644] hover:text-[#E8E8F0]'
              }`}
            >
              Tough Love
              <p className="text-xs font-normal mt-0.5 opacity-70">Honest &amp; direct</p>
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
            saved
              ? 'bg-[#6DBF87]/20 border border-[#6DBF87]/30 text-[#6DBF87]'
              : 'bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 text-white shadow-[0_2px_12px_rgba(193,122,71,0.25)] hover:shadow-[0_4px_20px_rgba(193,122,71,0.35)]'
          }`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {/* Account card */}
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <h2 className="text-base font-semibold text-[#E8E8F0] mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
