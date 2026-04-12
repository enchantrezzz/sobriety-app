import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function usePledge() {
  const { user } = useAuth()
  const [todayPledges, setTodayPledges] = useState([])
  const [pledgeStreak, setPledgeStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchPledge = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('pledges')
      .select('*')
      .eq('user_id', user.id)
      .eq('pledge_date', today)
    setTodayPledges(data ?? [])

    // Calculate streak (based on general pledge or any pledge per day)
    const { data: allPledges } = await supabase
      .from('pledges')
      .select('pledge_date')
      .eq('user_id', user.id)
      .order('pledge_date', { ascending: false })

    if (allPledges) {
      // Deduplicate by date
      const uniqueDates = [...new Set(allPledges.map(p => p.pledge_date))]
      let streak = 0
      let checkDate = new Date()
      for (const dateStr of uniqueDates) {
        const d = new Date(dateStr)
        const diff = Math.round((checkDate - d) / 86400000)
        if (diff <= 1) {
          streak++
          checkDate = d
        } else break
      }
      setPledgeStreak(streak)
    }

    setLoading(false)
  }, [user, today])

  useEffect(() => {
    fetchPledge()
  }, [fetchPledge])

  async function submitPledge(pledgeText, timerId = null) {
    // Check if a pledge already exists for this scope today
    let query = supabase
      .from('pledges')
      .select('id')
      .eq('user_id', user.id)
      .eq('pledge_date', today)

    if (timerId) {
      query = query.eq('timer_id', timerId)
    } else {
      query = query.is('timer_id', null)
    }

    const { data: existing } = await query.maybeSingle()

    let data, error
    if (existing) {
      // Update existing pledge
      ;({ data, error } = await supabase
        .from('pledges')
        .update({ pledge_text: pledgeText })
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      // Insert new pledge
      ;({ data, error } = await supabase
        .from('pledges')
        .insert({ user_id: user.id, pledge_text: pledgeText, pledge_date: today, timer_id: timerId ?? null })
        .select()
        .single())
    }

    if (error) throw error
    setTodayPledges(prev => {
      const filtered = prev.filter(p =>
        timerId ? p.timer_id !== timerId : p.timer_id === null
      )
      return [...filtered, data]
    })
    return data
  }

  // Convenience: first general pledge (timer_id is null)
  const todayPledge = todayPledges.find(p => p.timer_id === null) ?? null

  return { todayPledge, todayPledges, pledgeStreak, loading, submitPledge, refetch: fetchPledge }
}
