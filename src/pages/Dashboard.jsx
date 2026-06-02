import { useAuth } from '../context/AuthContext'
import PledgeCard from '../components/PledgeCard'
import { useTimer } from '../hooks/useTimer'
import { useQuote } from '../hooks/useQuote'
import CounterCard from '../components/CounterCard'
import MotivationalMessage from '../components/MotivationalMessage'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()
  const { timers } = useTimer()
  const { quote, verse } = useQuote()

  const firstName = profile?.username?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]">{greeting}, {firstName}.</h1>
        <p className="text-[#8B8FA8] text-sm mt-1">Here&apos;s where you stand today.</p>
      </div>

      {/* Daily motivational quote */}
      {quote && (
        <div className="bg-[#16181F] border border-[#2A2D38] rounded-2xl p-6">
          <p className="text-[#8B8FA8] text-[10px] uppercase tracking-widest font-semibold mb-3">Today&apos;s quote</p>
          <p className="text-[#E8E8F0] text-base italic leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            &quot;{quote.q}&quot;
          </p>
          {quote.a && quote.a !== 'Unknown' && (
            <p className="text-[#8B8FA8] text-sm mt-3">— {quote.a}</p>
          )}
        </div>
      )}

      <MotivationalMessage tone={profile?.motivational_tone ?? 'gentle'} />

      {/* Daily Bible verse */}
      {verse && (
        <div className="bg-[#16181F] border border-[#C17A47]/20 rounded-2xl p-6">
          <p className="text-[#C17A47] text-[10px] uppercase tracking-widest font-semibold mb-3">✝ Daily verse</p>
          <p className="text-[#E8E8F0] text-base italic leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            &quot;{verse.text}&quot;
          </p>
          <p className="text-[#C17A47]/80 text-sm mt-3">— {verse.reference}</p>
        </div>
      )}

      <PledgeCard />

      {timers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#E8E8F0]">Your timers</h2>
            <Link to="/timers" className="text-[#C17A47] hover:text-[#E8955A] text-sm transition-colors">
              See all →
            </Link>
          </div>
          <div className="space-y-4">
            {timers.slice(0, 2).map(timer => (
              <CounterCard
                key={timer.id}
                timer={timer}
                onReset={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {timers.length === 0 && (
        <div className="bg-[#16181F] rounded-2xl p-6 border border-dashed border-[#2A2D38] text-center">
          <p className="text-[#8B8FA8] mb-4">No timers yet. Start tracking your sobriety.</p>
          <Link
            to="/timers"
            className="inline-block bg-[#C17A47] hover:bg-[#A5622F] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-[0_2px_12px_rgba(193,122,71,0.3)]"
          >
            Add a timer
          </Link>
        </div>
      )}
    </div>
  )
}
