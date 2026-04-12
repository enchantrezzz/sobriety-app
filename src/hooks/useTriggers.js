import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export const TRIGGER_CATEGORIES = [
  'Stress', 'Boredom', 'Social Pressure', 'Physical Pain',
  'Emotional Pain', 'Relationship Issues', 'Work / School',
  'Financial Pressure', 'Celebration', 'Environmental Cue', 'Other',
]

export const EMOTIONAL_STATES = [
  'Stressed', 'Anxious', 'Bored', 'Lonely', 'Angry', 'Sad',
  'Tired', 'Overwhelmed', 'Excited', 'Happy', 'Numb', 'Other',
]

export function useTriggers() {
  const { user } = useAuth()
  const [triggers, setTriggers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTriggers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTriggers(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTriggers()
  }, [fetchTriggers])

  async function logTrigger(entry) {
    const { data, error } = await supabase
      .from('trigger_logs')
      .insert({ user_id: user.id, ...entry })
      .select()
      .single()
    if (error) throw error
    setTriggers(prev => [data, ...prev])
    return data
  }

  // Insight helpers
  function getTopTriggers(limit = 5) {
    const counts = {}
    triggers.forEach(t => {
      counts[t.trigger_category] = (counts[t.trigger_category] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category, count]) => ({ category, count }))
  }

  function getResistanceRate() {
    if (!triggers.length) return null
    const resisted = triggers.filter(t => t.resisted).length
    return Math.round((resisted / triggers.length) * 100)
  }

  return { triggers, loading, logTrigger, getTopTriggers, getResistanceRate, refetch: fetchTriggers }
}
