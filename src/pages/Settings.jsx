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
      <h1 className="text-2xl font-bold text-[#3D2B1F]">Settings</h1>

      <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)] space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#5C4033] mb-1">Email</label>
          <p className="text-[#8C7264] text-sm">{user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5C4033] mb-3">Motivational tone</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTone('gentle')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                tone === 'gentle'
                  ? 'bg-[#C17A47] text-white'
                  : 'border border-[#DCC9B4] text-[#5C4033] hover:bg-[#F5EDE0]'
              }`}
            >
              Gentle
              <p className="text-xs font-normal mt-0.5 opacity-70">Warm &amp; supportive</p>
            </button>
            <button
              onClick={() => setTone('tough')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                tone === 'tough'
                  ? 'bg-[#C17A47] text-white'
                  : 'border border-[#DCC9B4] text-[#5C4033] hover:bg-[#F5EDE0]'
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
          className="w-full bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-[#E8D9C8] shadow-[0_2px_12px_rgba(139,90,43,0.07)]">
        <h2 className="text-lg font-semibold text-[#3D2B1F] mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          className="w-full border border-red-300 text-red-500 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
