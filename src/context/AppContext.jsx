import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [milestoneAlert, setMilestoneAlert] = useState(null) // { timerName, days }

  function showMilestone(timerName, days) {
    setMilestoneAlert({ timerName, days })
  }

  function dismissMilestone() {
    setMilestoneAlert(null)
  }

  return (
    <AppContext.Provider value={{ milestoneAlert, showMilestone, dismissMilestone }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
