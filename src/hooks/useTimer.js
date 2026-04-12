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

  async function addTimer(addictionName, startedAt = new Date().toISOString()) {
    const { data, error } = await supabase
      .from('timers')
      .insert({ user_id: user.id, addiction_name: addictionName, started_at: startedAt })
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

  async function fetchArchivedTimers() {
    if (!user) return []
    const { data } = await supabase
      .from('timers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', false)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async function deleteTimer(timerId) {
    await supabase.from('relapses').delete().eq('timer_id', timerId)
    await supabase.from('timers').delete().eq('id', timerId)
    setTimers(prev => prev.filter(t => t.id !== timerId))
  }

  async function restoreTimer(timerId) {
    const { data, error } = await supabase
      .from('timers')
      .update({ is_active: true })
      .eq('id', timerId)
      .select()
      .single()
    if (error) throw error
    setTimers(prev => [...prev, data])
    return data
  }

  return { timers, loading, addTimer, resetTimer, archiveTimer, deleteTimer, fetchArchivedTimers, restoreTimer, getElapsed, refetch: fetchTimers }
}
