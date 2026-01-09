import { delay } from './api'
import type { ResearchReport } from '@/types'

// In-memory mock storage
let reports: ResearchReport[] = []

export const reportService = {
  async getReports(search?: string): Promise<ResearchReport[]> {
    await delay(200)
    if (!search) return reports

    const query = search.toLowerCase()
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        (r.bookTitle?.toLowerCase().includes(query) ?? false) ||
        (r.authorName?.toLowerCase().includes(query) ?? false) ||
        (r.topic?.toLowerCase().includes(query) ?? false)
    )
  },

  async getReport(id: string): Promise<ResearchReport | null> {
    await delay(100)
    return reports.find((r) => r.id === id) || null
  },

  async deleteReport(id: string): Promise<void> {
    await delay(100)
    reports = reports.filter((r) => r.id !== id)
  },

  async updateReport(report: ResearchReport): Promise<ResearchReport> {
    await delay(200)
    const updated = { ...report, updatedAt: new Date().toISOString() }
    reports = reports.map((r) => (r.id === report.id ? updated : r))
    return updated
  },

  // For internal use - adds report from agent
  addReport(report: ResearchReport): void {
    reports = [report, ...reports]
  },
}
