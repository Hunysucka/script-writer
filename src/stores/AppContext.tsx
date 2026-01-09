import { useReducer, useEffect, type ReactNode } from 'react'
import { appReducer, initialState } from './appReducer'
import { AppContext } from './context'
import { storage } from '@/utils/storage'

function getInitialState() {
  return {
    ...initialState,
    reports: storage.getReports(),
    scripts: storage.getScripts(),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState)

  // Persist reports to localStorage
  useEffect(() => {
    storage.setReports(state.reports)
  }, [state.reports])

  // Persist scripts to localStorage
  useEffect(() => {
    storage.setScripts(state.scripts)
  }, [state.scripts])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
