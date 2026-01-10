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
  result?: ResearchReport | Script
  error?: string
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
      result: response.result,
      error: response.error,
      startedAt: new Date().toISOString(),
      ...(response.status === 'completed' || response.status === 'failed'
        ? { completedAt: new Date().toISOString() }
        : {}),
    }
  },
}
