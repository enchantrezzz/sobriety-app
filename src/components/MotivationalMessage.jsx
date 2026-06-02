import { useMemo } from 'react'

const GENTLE_QUOTES = [
  "You don't have to be perfect. You just have to keep going.",
  'Every moment you choose not to use, you are reclaiming your life.',
  'Be gentle with yourself. Recovery is not a straight line.',
  'You are not your addiction. You are so much more.',
  'Small steps still move you forward.',
  "Today doesn't have to be perfect. It just has to be today.",
  'You have survived every hard day so far. That is 100%.',
  'Healing happens slowly, quietly, and surely.',
  "You are worth the effort you're putting in.",
  'One breath. One moment. One choice. You can do this.',
]

const TOUGH_QUOTES = [
  "Get up. You've been through worse.",
  "Your future self is counting on the decision you make right now. Don't let them down.",
  'Excuses are comfortable. Your old life was comfortable. Choose discomfort.',
  'You want it? Then do the work. Every single day.',
  'No one is coming to save you — and you are strong enough not to need saving.',
  'The craving will pass. The regret of giving in lasts much longer.',
  'Hard is not impossible.',
  'You already know what giving in feels like. Try something different.',
  "Champions do what they need to do even when they don't feel like it.",
  'This moment will define you. Choose wisely.',
]

const TODAY_SEED = Math.floor(Date.now() / 86400000)

export default function MotivationalMessage({ tone = 'gentle' }) {
  const quote = useMemo(() => {
    const pool = tone === 'tough' ? TOUGH_QUOTES : GENTLE_QUOTES
    return pool[TODAY_SEED % pool.length]
  }, [tone])

  return (
    <div className="relative bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C17A47]/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C17A47] to-[#C17A47]/20 rounded-l-2xl" />

      <div className="relative flex items-center justify-between mb-3">
        <p className="text-[#C17A47] text-[10px] uppercase tracking-widest font-semibold">✦ Daily affirmation</p>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#2A2D38] text-[#8B8FA8]">
          {tone === 'tough' ? 'Tough love' : 'Gentle'}
        </span>
      </div>

      <p className="relative text-[#B0B3C6] text-base italic leading-relaxed pl-3" style={{ fontFamily: 'Lora, Georgia, serif' }}>
        &quot;{quote}&quot;
      </p>
    </div>
  )
}
