import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C36.9 36.2 44 31 44 24c0-1.3-.1-2.7-.4-3.9z"/>
    </svg>
  )
}

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, username)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#C17A47]/15 border border-[#C17A47]/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(193,122,71,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M12 2C6 2 2 7 2 12s4 10 10 10 10-4.5 10-10S18 2 12 2z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#E8E8F0] mb-2">Start your journey</h1>
          <p className="text-[#8B8FA8]">One day at a time. We&apos;re with you.</p>
        </div>

        <div className="bg-[#16181F] rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-[#2A2D38] space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#1E2028] hover:bg-[#252830] disabled:opacity-50 text-[#E8E8F0] font-semibold py-2.5 rounded-xl transition-colors border border-[#2A2D38] hover:border-[#333644] cursor-pointer"
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2A2D38]" />
            <span className="text-[#8B8FA8] text-xs">or</span>
            <div className="flex-1 h-px bg-[#2A2D38]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">Name</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
                placeholder="Your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B0B3C6] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#1E2028] border border-[#2A2D38] rounded-xl px-4 py-2.5 text-[#E8E8F0] placeholder-[#8B8FA8] focus:outline-none focus:ring-2 focus:ring-[#C17A47]/40 focus:border-[#C17A47]/50 transition-all"
                placeholder="Min. 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_2px_16px_rgba(193,122,71,0.3)] hover:shadow-[0_4px_24px_rgba(193,122,71,0.4)] cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8B8FA8] text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C17A47] hover:text-[#E8955A] font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
