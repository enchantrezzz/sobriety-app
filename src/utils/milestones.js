export function getCrossedMilestones(previousDays, currentDays, milestones) {
  if (currentDays <= previousDays) return []
  return milestones.filter(
    milestoneDay => milestoneDay > previousDays && milestoneDay <= currentDays
  )
}

export function getMilestoneStorageKey(timerId, startedAt, milestoneDay) {
  return `milestone_shown:${timerId}:${startedAt}:${milestoneDay}`
}

export function wasMilestoneShown(storage, timerId, startedAt, milestoneDay) {
  return storage.getItem(getMilestoneStorageKey(timerId, startedAt, milestoneDay)) === '1'
}

export function markMilestoneShown(storage, timerId, startedAt, milestoneDay) {
  storage.setItem(getMilestoneStorageKey(timerId, startedAt, milestoneDay), '1')
}
