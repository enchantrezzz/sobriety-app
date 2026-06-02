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
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#3D2B1F]">{greeting}, {firstName}.</h1>
        <p className="text-[#8C7264] text-sm mt-1">Here&apos;s where you stand today.</p>
      </div>

      {/* Daily motivational quote */}
      {quote && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-[#E8D9C8]">
          <p className="text-[#A69080] text-xs uppercase tracking-wider mb-3 font-medium">Today&apos;s quote</p>
          <p className="text-[#3D2B1F] text-base italic leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>&quot;{quote.q}&quot;</p>
          {quote.a && quote.a !== 'Unknown' && (
            <p className="text-[#8C7264] text-sm mt-3">— {quote.a}</p>
          )}
        </div>
      )}

      <MotivationalMessage tone={profile?.motivational_tone ?? 'gentle'} />

      {/* Daily Bible verse */}
      {verse && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
          <p className="text-amber-700/80 text-xs uppercase tracking-wider mb-3 font-medium">✝ Daily verse</p>
          <p className="text-[#3D2B1F] text-base italic leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>&quot;{verse.text}&quot;</p>
          <p className="text-amber-600 text-sm mt-3">— {verse.reference}</p>
        </div>
      )}

      <PledgeCard />

      {timers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#3D2B1F]">Your timers</h2>
            <Link to="/timers" className="text-[#C17A47] text-sm hover:text-[#A5622F] transition-colors">
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
              />
            ))}
          </div>
        </div>
      )}

      {timers.length === 0 && (
        <div className="bg-[#FFFAF4] rounded-2xl p-6 border border-dashed border-[#DCC9B4] text-center">
          <p className="text-[#8C7264] mb-4">No timers yet. Start tracking your sobriety.</p>
          <Link
            to="/timers"
            className="inline-block bg-[#C17A47] hover:bg-[#A5622F] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Add a timer
          </Link>
        </div>
      )}
    </div>
  )
}
