import { describe, expect, it } from 'vitest'
import {
  getCrossedMilestones,
  getMilestoneStorageKey,
  markMilestoneShown,
  wasMilestoneShown,
} from './milestones'

function createMemoryStorage() {
  const store = new Map()
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
  }
}

describe('milestone helpers', () => {
  it('detects threshold crossings only when days increase', () => {
    const milestones = [1, 3, 7, 14]
    expect(getCrossedMilestones(0, 0, milestones)).toEqual([])
    expect(getCrossedMilestones(0, 1, milestones)).toEqual([1])
    expect(getCrossedMilestones(1, 8, milestones)).toEqual([3, 7])
    expect(getCrossedMilestones(8, 2, milestones)).toEqual([])
  })

  it('stores and checks milestone shown state', () => {
    const storage = createMemoryStorage()
    const timerId = 'timer-1'
    const startedAt = '2026-06-02T10:00:00.000Z'
    const milestoneDay = 7

    expect(wasMilestoneShown(storage, timerId, startedAt, milestoneDay)).toBe(false)
    markMilestoneShown(storage, timerId, startedAt, milestoneDay)
    expect(wasMilestoneShown(storage, timerId, startedAt, milestoneDay)).toBe(true)
  })

  it('creates different keys for new streaks after reset', () => {
    const timerId = 'timer-1'
    const milestoneDay = 7
    const beforeReset = '2026-06-01T00:00:00.000Z'
    const afterReset = '2026-06-02T00:00:00.000Z'

    const oldKey = getMilestoneStorageKey(timerId, beforeReset, milestoneDay)
    const newKey = getMilestoneStorageKey(timerId, afterReset, milestoneDay)

    expect(oldKey).not.toBe(newKey)
  })
})
