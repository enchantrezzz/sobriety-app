import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const CRISIS_KEYWORDS = ["can't do this", 'give up', 'hopeless', 'relapse now', 'going to use', 'going to drink', 'want to die', "can't stop"]

const GROUNDING_EXERCISES = [
  '5-4-3-2-1: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
  'Take 3 slow deep breaths. In for 4 counts, hold for 4, out for 6.',
  'Hold a piece of ice in your hand. Focus on the sensation until the urge passes.',
  'Go outside or open a window. Feel the air on your face.',
  'Text or call someone you trust right now.',
]

const CRISIS_LINE = 'SAMHSA Helpline: 1-800-662-4357 (free, confidential, 24/7)'
const GREETING = { role: 'assistant', content: "Hey. I'm here. This is a judgment-free space — you can talk about anything that's on your mind. How are you doing right now?" }

function isCrisis(text) {
  return CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw))
}

function formatDate(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function sessionPreview(messages) {
  const last = [...messages].reverse().find(m => m.role === 'user')
  return last?.content?.slice(0, 55) ?? 'New conversation'
}

export default function AIChat() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [crisis, setCrisis] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)

  const fetchSessions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from('chat_sessions')
      .select('id, messages, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(30)
    return data ?? []
  }, [])

  useEffect(() => {
    async function init() {
      const data = await fetchSessions()
      setSessions(data)
      if (data[0]?.messages?.length > 0) {
        setMessages(data[0].messages)
        setSessionId(data[0].id)
      }
      setSessionLoading(false)
    }
    init()
  }, [fetchSessions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function loadSession(s) {
    setMessages(s.messages?.length > 0 ? s.messages : [GREETING])
    setSessionId(s.id)
  }

  function startNewSession() {
    setMessages([GREETING])
    setSessionId(null)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    if (isCrisis(text)) setCrisis(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            messages: newMessages,
            sessionId,
            motivationalTone: profile?.motivational_tone ?? 'gentle',
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to reach AI')

      const { reply, sessionId: newSessionId } = await response.json()

      if (newSessionId && !sessionId) {
        setSessionId(newSessionId)
        fetchSessions().then(setSessions)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. If you're in crisis, please call SAMHSA at 1-800-662-4357." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (sessionLoading) {
    return <div className="flex items-center justify-center h-screen text-[#8C7264] bg-[#FDF6EE]">Loading…</div>
  }

  return (
    <div className="flex h-screen pb-16 md:pb-0 overflow-hidden bg-[#FDF6EE]">

      {/* ── Chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-subtle surface-bg shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#C17A47]/15 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C17A47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#3D2B1F] font-semibold text-sm">Vent Space</p>
            <p className="text-[#8C7264] text-xs">Judgment-free. Private.</p>
          </div>
          <button
            onClick={() => setCrisis(true)}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Help
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="hidden md:flex items-center gap-1.5 text-[#8C7264] hover:text-[#3D2B1F] text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#F5EDE0] transition-colors shrink-0 cursor-pointer"
            title={sidebarOpen ? 'Hide conversations' : 'Show conversations'}
          >
            <span>{sidebarOpen ? '→' : '←'}</span>
            <span>{sidebarOpen ? 'Hide' : 'History'}</span>
          </button>
        </div>

        {/* Crisis panel */}
        {crisis && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-4 space-y-3 shrink-0">
            <p className="text-red-700 font-semibold text-sm">You don&apos;t have to go through this alone.</p>
            <p className="text-red-600 text-xs font-medium">{CRISIS_LINE}</p>
            <div className="space-y-1">
              {GROUNDING_EXERCISES.map((ex, i) => (
                <p key={i} className="text-red-500 text-xs">• {ex}</p>
              ))}
            </div>
            <button onClick={() => setCrisis(false)} className="text-red-400 text-xs underline cursor-pointer">Close</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'max-w-[45%] bg-[#C17A47] text-white rounded-br-sm'
                  : 'max-w-[60%] surface-bg text-[#3D2B1F] rounded-bl-sm border border-subtle shadow-[0_1px_4px_rgba(139,90,43,0.06)]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="surface-bg text-[#8C7264] px-4 py-3 rounded-2xl rounded-bl-sm text-sm border border-subtle">
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-subtle surface-bg shrink-0">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Talk to me…"
              rows={1}
              className="flex-1 bg-[#F5EDE0] border border-[#DCC9B4] rounded-xl px-4 py-2.5 text-[#3D2B1F] placeholder-[#A69080] text-sm focus:outline-none focus:ring-2 focus:ring-[#C17A47] resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-40 text-white rounded-xl px-4 text-sm font-semibold transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
          <p className="text-[#A69080] text-xs mt-2 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* ── Right sidebar — desktop only ── */}
      <div className={`
        hidden md:flex flex-col border-l border-subtle surface-bg
        transition-all duration-200 overflow-hidden shrink-0
        ${sidebarOpen ? 'w-64' : 'w-0 border-l-0'}
      `}>
        {sidebarOpen && (
          <>
            <div className="flex items-center justify-between px-4 py-4 border-b border-subtle">
              <span className="text-[#3D2B1F] font-semibold text-sm">Conversations</span>
            </div>

            <div className="px-3 py-3">
              <button
                onClick={startNewSession}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#DCC9B4] text-[#8C7264] hover:text-[#3D2B1F] hover:border-[#C17A47]/40 text-sm transition-colors cursor-pointer"
              >
                + New conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {sessions.length === 0 && (
                <p className="text-[#A69080] text-xs px-3 py-2">No past conversations.</p>
              )}
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => loadSession(s)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                    s.id === sessionId
                      ? 'bg-[#C17A47]/10 border border-[#C17A47]/20'
                      : 'hover:bg-[#F5EDE0]'
                  }`}
                >
                  <p className="text-[#5C4033] text-xs font-medium truncate leading-snug">
                    {sessionPreview(s.messages)}
                  </p>
                  <p className="text-[#A69080] text-xs mt-1">{formatDate(s.updated_at)}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
