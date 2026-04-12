import { useEffect, useState } from 'react'

// Recovery-relevant Bible verse references
const VERSE_REFS = [
  '1+corinthians+10:13',
  'philippians+4:13',
  'isaiah+41:10',
  'psalm+34:18',
  '2+corinthians+5:17',
  'lamentations+3:22-23',
  'james+4:7',
  'romans+12:2',
  'psalm+46:1',
  'matthew+11:28',
  'romans+6:14',
  'hebrews+12:1',
  'galatians+5:1',
  'psalm+23:4',
  '1+peter+5:10',
  'romans+8:28',
  'jeremiah+29:11',
  'john+8:36',
  'psalm+40:2',
  'isaiah+43:2',
]

// Curated recovery & sobriety quotes
const RECOVERY_QUOTES = [
  { q: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.", a: 'Unknown' },
  { q: "Fall seven times, stand up eight.", a: 'Japanese Proverb' },
  { q: "You don't have to see the whole staircase, just take the first step.", a: 'Martin Luther King Jr.' },
  { q: "The only way out is through.", a: 'Robert Frost' },
  { q: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", a: 'Ralph Waldo Emerson' },
  { q: "Strength does not come from physical capacity. It comes from an indomitable will.", a: 'Mahatma Gandhi' },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: 'Confucius' },
  { q: "You are braver than you believe, stronger than you seem, and smarter than you think.", a: 'A.A. Milne' },
  { q: "Every moment is a fresh beginning.", a: 'T.S. Eliot' },
  { q: "The secret of getting ahead is getting started.", a: 'Mark Twain' },
  { q: "He who has a why to live can bear almost any how.", a: 'Friedrich Nietzsche' },
  { q: "Our greatest glory is not in never falling, but in rising every time we fall.", a: 'Confucius' },
  { q: "Hardships often prepare ordinary people for an extraordinary destiny.", a: 'C.S. Lewis' },
  { q: "You are never too broken to be fixed.", a: 'Unknown' },
  { q: "One day at a time — this is enough. Do not look back and grieve over the past, for it is gone.", a: 'Ida Scott Taylor' },
  { q: "The human capacity to transform pain into purpose is one of the most powerful forces in the world.", a: 'Unknown' },
  { q: "Sobriety is a journey, not a destination.", a: 'Unknown' },
  { q: "You didn't come this far to only come this far.", a: 'Unknown' },
  { q: "Your worst days are never so bad that you are beyond the reach of grace.", a: 'Unknown' },
  { q: "Every day you fight is a day you win.", a: 'Unknown' },
]

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function pickByDay(arr) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return arr[dayOfYear % arr.length]
}

export function useQuote() {
  const [verse, setVerse] = useState(null)
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = todayKey()

      // ── Quote (from local curated list) ──
      const cachedQuote = localStorage.getItem('sobriety_quote_date') === today
        ? JSON.parse(localStorage.getItem('sobriety_quote'))
        : null

      if (cachedQuote) {
        setQuote(cachedQuote)
      } else {
        const q = pickByDay(RECOVERY_QUOTES)
        localStorage.setItem('sobriety_quote', JSON.stringify(q))
        localStorage.setItem('sobriety_quote_date', today)
        setQuote(q)
      }

      // ── Bible verse (fetched from bible-api.com) ──
      const cachedVerse = localStorage.getItem('sobriety_verse_date') === today
        ? JSON.parse(localStorage.getItem('sobriety_verse'))
        : null

      if (cachedVerse) {
        setVerse(cachedVerse)
      } else {
        const ref = pickByDay(VERSE_REFS)
        try {
          const res = await fetch(`https://bible-api.com/${ref}?translation=web`)
          if (res.ok) {
            const data = await res.json()
            const v = { text: data.text?.trim(), reference: data.reference }
            localStorage.setItem('sobriety_verse', JSON.stringify(v))
            localStorage.setItem('sobriety_verse_date', today)
            setVerse(v)
          }
        } catch {
          // silently skip if offline
        }
      }

      setLoading(false)
    }

    load()
  }, [])

  return { quote, verse, loading }
}
