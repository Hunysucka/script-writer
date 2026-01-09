import type { ResearchReport, Script } from '@/types'

const STORAGE_KEYS = {
  REPORTS: 'scriptwriter_reports',
  SCRIPTS: 'scriptwriter_scripts',
} as const

export const storage = {
  getReports(): ResearchReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS)
      return data ? JSON.parse(data) : []
    } catch {
      console.error('Failed to load reports from localStorage')
      return []
    }
  },

  setReports(reports: ResearchReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    } catch {
      console.error('Failed to save reports to localStorage')
    }
  },

  getScripts(): Script[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS)
      return data ? JSON.parse(data) : []
    } catch {
      console.error('Failed to load scripts from localStorage')
      return []
    }
  },

  setScripts(scripts: Script[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts))
    } catch {
      console.error('Failed to save scripts to localStorage')
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.REPORTS)
    localStorage.removeItem(STORAGE_KEYS.SCRIPTS)
  },
}
