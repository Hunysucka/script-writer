import { useReducer, useEffect, type ReactNode } from 'react'
import { appReducer, initialState } from './appReducer'
import { AppContext } from './context'
import { reportService } from '@/services/reportService'
import { scriptService } from '@/services/scriptService'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data from API on mount
  useEffect(() => {
    async function loadData() {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const [reports, scripts] = await Promise.all([
          reportService.getReports(),
          scriptService.getScripts(),
        ])
        dispatch({ type: 'SET_REPORTS', payload: reports })
        dispatch({ type: 'SET_SCRIPTS', payload: scripts })
      } catch (error) {
        console.error('Failed to load data:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from server' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadData()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
