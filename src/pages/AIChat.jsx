import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

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

  // Auto-resize textarea height as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  function loadSession(s) {
    setMessages(s.messages?.length > 0 ? s.messages : [GREETING])
    setSessionId(s.id)
  }

  function startNewSession() {
    setMessages([GREETING])
    setSessionId(null)
  }

  async function deleteSession(id, e) {
    e.stopPropagation()
    const confirmDelete = window.confirm("Are you sure you want to delete this conversation?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSessions(prev => prev.filter(s => s.id !== id))
      if (sessionId === id) {
        startNewSession()
      }
    } catch (err) {
      alert("Failed to delete the conversation: " + err.message)
    }
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
    return <div className="flex items-center justify-center h-screen text-[#8B8FA8] bg-[#0F1117]">Loading…</div>
  }

  return (
    <div className="flex h-screen pb-16 md:pb-0 overflow-hidden bg-[#0F1117] relative">

      {/* ── Sidebar Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 cursor-pointer pointer-events-auto"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#13151C] border-r border-[#2A2D38] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2D38]/60">
                <span className="text-[#E8E8F0] font-semibold text-sm">Past Conversations</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#8B8FA8] hover:text-[#E8E8F0] p-1.5 rounded-lg hover:bg-[#1E2028] transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="px-4 py-3">
                <button
                  onClick={() => {
                    startNewSession()
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#2A2D38] hover:border-[#C17A47]/40 text-[#8B8FA8] hover:text-[#E8E8F0] text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer bg-[#1E2028]/30 hover:bg-[#1E2028]/70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Conversation
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
                {sessions.length === 0 && (
                  <p className="text-[#8B8FA8] text-xs px-3 py-4 text-center italic">No past conversations yet.</p>
                )}
                {sessions.map(s => {
                  const isActive = s.id === sessionId
                  return (
                    <div
                      key={s.id}
                      className="group relative flex items-center w-full"
                    >
                      <button
                        onClick={() => {
                          loadSession(s)
                          setSidebarOpen(false)
                        }}
                        className={`w-full text-left pl-4 pr-10 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#C17A47]/10 border-[#C17A47]/30 text-[#E8955A]'
                            : 'bg-transparent border-transparent hover:bg-[#1E2028]/60 text-[#8B8FA8] hover:text-[#E8E8F0]'
                        }`}
                      >
                        <p className="font-medium text-xs truncate leading-relaxed">
                          {sessionPreview(s.messages)}
                        </p>
                        <span className="text-[10px] text-[#8B8FA8]/80 mt-1.5 block">
                          {formatDate(s.updated_at)}
                        </span>
                      </button>

                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="absolute right-2.5 opacity-0 group-hover:opacity-100 hover:text-red-400 text-[#8B8FA8] p-1.5 rounded-lg hover:bg-[#1E2028] transition-all duration-200 cursor-pointer z-10"
                        title="Delete conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#2A2D38]/60 bg-[#13151C] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl text-[#8B8FA8] hover:text-[#E8E8F0] hover:bg-[#1E2028] transition-all cursor-pointer mr-1 animate-pulse"
            title="History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[#E8E8F0] font-semibold text-sm">Vent Space</p>
            <p className="text-[#8B8FA8] text-xs">Judgment-free. Private.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewSession}
              className="flex items-center gap-1.5 bg-[#1E2028] hover:bg-[#2A2D38] border border-[#2A2D38] text-[#E8E8F0] hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
              </svg>
              <span className="hidden sm:inline">New Vent</span>
            </button>

            <button
              onClick={() => setCrisis(true)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Crisis help
            </button>
          </div>
        </div>

        {/* Crisis panel */}
        <AnimatePresence>
          {crisis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-red-950/20 border-b border-red-900/40 px-4 py-4 shrink-0 overflow-hidden"
            >
              <div className="max-w-2xl mx-auto w-full space-y-3">
                <p className="text-red-400 font-semibold text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  You don&apos;t have to go through this alone.
                </p>
                <p className="text-red-300/90 text-xs font-semibold">{CRISIS_LINE}</p>
                <div className="space-y-1.5 pl-2.5 border-l border-red-500/20">
                  {GROUNDING_EXERCISES.map((ex, i) => (
                    <p key={i} className="text-red-400/80 text-xs">• {ex}</p>
                  ))}
                </div>
                <button onClick={() => setCrisis(false)} className="text-red-400/60 hover:text-red-400 text-xs font-semibold underline cursor-pointer transition-colors block mt-2">
                  Close crisis helper
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'max-w-[85%] sm:max-w-[75%] bg-[#C17A47] text-white rounded-br-none shadow-[0_2px_12px_rgba(193,122,71,0.2)] font-medium'
                    : 'max-w-[85%] sm:max-w-[75%] bg-[#16181F]/60 border border-[#2A2D38]/60 text-[#E8E8F0] rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#16181F]/40 border border-[#2A2D38]/40 text-[#8B8FA8] px-4 py-3 rounded-2xl rounded-bl-none text-sm flex items-center justify-center">
                  <span className="flex gap-1.5 py-1 px-0.5">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: dot * 0.15
                        }}
                        className="w-1.5 h-1.5 bg-[#8B8FA8] rounded-full"
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-[#2A2D38]/50 bg-[#13151C]/90 backdrop-blur-xs shrink-0">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex gap-2.5 items-end bg-[#1E2028] border border-[#2A2D38] rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#C17A47]/40 focus-within:border-[#C17A47]/50 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                rows={1}
                className="flex-1 bg-transparent text-[#E8E8F0] placeholder-[#8B8FA8] text-sm focus:outline-none resize-none px-2.5 py-1.5 max-h-32 min-h-[36px]"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-[#C17A47] hover:bg-[#A5622F] disabled:opacity-40 disabled:hover:bg-[#C17A47] text-white rounded-xl p-2.5 transition-all cursor-pointer shadow-[0_2px_8px_rgba(193,122,71,0.2)] shrink-0 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className="text-[#8B8FA8]/60 text-[10px] mt-2 text-center tracking-wide">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
