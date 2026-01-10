import { apiRequest } from './api'
import type { ResearchReport } from '@/types'

// Transform MongoDB document to frontend format
function transformReport(doc: Record<string, unknown>): ResearchReport {
  return {
    id: (doc._id as string) || (doc.id as string),
    title: doc.title as string,
    researchType: doc.researchType as ResearchReport['researchType'],
    bookTitle: doc.bookTitle as string | undefined,
    authorName: doc.authorName as string | undefined,
    topic: doc.topic as string | undefined,
    content: doc.content as string,
    summary: doc.summary as string,
    sources: doc.sources as string[],
    status: 'completed',
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  }
}

export const reportService = {
  async getReports(search?: string): Promise<ResearchReport[]> {
    const endpoint = search ? `/reports?search=${encodeURIComponent(search)}` : '/reports'
    const docs = await apiRequest<Record<string, unknown>[]>(endpoint)
    return docs.map(transformReport)
  },

  async getReport(id: string): Promise<ResearchReport | null> {
    try {
      const doc = await apiRequest<Record<string, unknown>>(`/reports/${id}`)
      return transformReport(doc)
    } catch {
      return null
    }
  },

  async deleteReport(id: string): Promise<void> {
    await apiRequest(`/reports/${id}`, { method: 'DELETE' })
  },

  async updateReport(report: ResearchReport): Promise<ResearchReport> {
    const doc = await apiRequest<Record<string, unknown>>(`/reports/${report.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: report.title,
        content: report.content,
        summary: report.summary,
      }),
    })
    return transformReport(doc)
  },
}
