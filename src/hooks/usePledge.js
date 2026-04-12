import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function usePledge() {
  const { user } = useAuth()
  const [todayPledge, setTodayPledge] = useState(null)
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
      .single()
    setTodayPledge(data ?? null)

    // Calculate streak
    const { data: allPledges } = await supabase
      .from('pledges')
      .select('pledge_date')
      .eq('user_id', user.id)
      .order('pledge_date', { ascending: false })

    if (allPledges) {
      let streak = 0
      let checkDate = new Date()
      for (const pledge of allPledges) {
        const d = new Date(pledge.pledge_date)
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

  async function submitPledge(pledgeText) {
    const { data, error } = await supabase
      .from('pledges')
      .upsert({ user_id: user.id, pledge_text: pledgeText, pledge_date: today }, { onConflict: 'user_id,pledge_date' })
      .select()
      .single()
    if (error) throw error
    setTodayPledge(data)
    return data
  }

  return { todayPledge, pledgeStreak, loading, submitPledge, refetch: fetchPledge }
}
