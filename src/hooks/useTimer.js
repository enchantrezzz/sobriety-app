import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export const MILESTONES_DAYS = [1, 3, 7, 14, 30, 90, 180, 365]

function getElapsed(startedAt) {
  const diff = Date.now() - new Date(startedAt).getTime()
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, totalSeconds }
}

export function useTimer() {
  const { user } = useAuth()
  const [timers, setTimers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTimers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('timers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    setTimers(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTimers()
  }, [fetchTimers])

  async function addTimer(addictionName) {
    const { data, error } = await supabase
      .from('timers')
      .insert({ user_id: user.id, addiction_name: addictionName, started_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    setTimers(prev => [...prev, data])
    return data
  }

  async function resetTimer(timerId, postMortem) {
    // Log the relapse
    const timer = timers.find(t => t.id === timerId)
    const { days } = getElapsed(timer.started_at)

    await supabase.from('relapses').insert({
      timer_id: timerId,
      user_id: user.id,
      days_clean_before: days,
      ...postMortem,
    })

    // Reset the timer
    const { data, error } = await supabase
      .from('timers')
      .update({ started_at: new Date().toISOString() })
      .eq('id', timerId)
      .select()
      .single()
    if (error) throw error
    setTimers(prev => prev.map(t => t.id === timerId ? data : t))
    return days
  }

  async function archiveTimer(timerId) {
    await supabase.from('timers').update({ is_active: false }).eq('id', timerId)
    setTimers(prev => prev.filter(t => t.id !== timerId))
  }

  return { timers, loading, addTimer, resetTimer, archiveTimer, getElapsed, refetch: fetchTimers }
}
