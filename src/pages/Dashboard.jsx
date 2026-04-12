import { useAuth } from '../context/AuthContext'
import PledgeCard from '../components/PledgeCard'
import { useTimer } from '../hooks/useTimer'
import { useQuote } from '../hooks/useQuote'
import CounterCard from '../components/CounterCard'
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
        <h1 className="text-2xl font-bold text-white">{greeting}, {firstName}.</h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s where you stand today.</p>
      </div>

      {/* Daily motivational quote */}
      {quote && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 rounded-2xl p-6 border border-indigo-500/20">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-medium">Today&apos;s quote</p>
          <p className="text-slate-100 text-base italic leading-relaxed">&quot;{quote.q}&quot;</p>
          {quote.a && quote.a !== 'Unknown' && (
            <p className="text-slate-400 text-sm mt-3">— {quote.a}</p>
          )}
        </div>
      )}

      {/* Daily Bible verse */}
      {verse && (
        <div className="bg-gradient-to-br from-amber-900/20 to-slate-800 rounded-2xl p-6 border border-amber-500/20">
          <p className="text-amber-400/80 text-xs uppercase tracking-wider mb-3 font-medium">✝ Daily verse</p>
          <p className="text-slate-100 text-base italic leading-relaxed">&quot;{verse.text}&quot;</p>
          <p className="text-amber-400/70 text-sm mt-3">— {verse.reference}</p>
        </div>
      )}

      <PledgeCard />

      {timers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Your timers</h2>
            <Link to="/timers" className="text-indigo-400 text-sm hover:text-indigo-300">
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
        <div className="bg-slate-800 rounded-2xl p-6 border border-dashed border-slate-600 text-center">
          <p className="text-slate-400 mb-4">No timers yet. Start tracking your sobriety.</p>
          <Link
            to="/timers"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Add a timer
          </Link>
        </div>
      )}
    </div>
  )
}
