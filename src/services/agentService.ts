import { apiRequest } from './api'
import type { AgentJob, AgentStatus, ResearchInput, ResearchReport, Script } from '@/types'

interface StartResearchResponse {
  jobId: string
  status: string
}

interface JobStatusResponse {
  id: string
  type: 'research' | 'script'
  status: AgentStatus
  progress: number
  result?: Record<string, unknown>
  error?: string
}

// Transform MongoDB document to frontend format
function transformResult(result: Record<string, unknown>, type: 'research' | 'script'): ResearchReport | Script {
  const id = (result._id as string) || (result.id as string)

  if (type === 'research') {
    return {
      id,
      title: result.title as string,
      researchType: result.researchType as ResearchReport['researchType'],
      bookTitle: result.bookTitle as string | undefined,
      authorName: result.authorName as string | undefined,
      topic: result.topic as string | undefined,
      content: result.content as string,
      summary: result.summary as string,
      sources: (result.sources as string[]) || [],
      status: 'completed',
      createdAt: result.createdAt as string,
      updatedAt: result.updatedAt as string,
    } as ResearchReport
  }

  return {
    id,
    title: result.title as string,
    content: result.content as string,
    platform: result.platform as Script['platform'],
    reportIds: (result.reportIds as string[]) || [],
    prompt: result.prompt as string,
    status: result.status as Script['status'],
    createdAt: result.createdAt as string,
    updatedAt: result.updatedAt as string,
  } as Script
}

export const agentService = {
  async startResearch(input: ResearchInput): Promise<AgentJob> {
    const response = await apiRequest<StartResearchResponse>('/agents/research', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    return {
      id: response.jobId,
      type: 'research',
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    }
  },

  async getJobStatus(jobId: string): Promise<AgentJob> {
    const response = await apiRequest<JobStatusResponse>(`/agents/${jobId}/status`)

    return {
      id: response.id,
      type: response.type,
      status: response.status,
      progress: response.progress,
      result: response.result ? transformResult(response.result, response.type) : undefined,
      error: response.error,
      startedAt: new Date().toISOString(),
      ...(response.status === 'completed' || response.status === 'failed'
        ? { completedAt: new Date().toISOString() }
        : {}),
    }
  },
}
