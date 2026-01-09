import { delay, generateId } from './api'
import type { AgentJob, ResearchReport } from '@/types'

// Mock job storage
const jobs = new Map<string, AgentJob>()

// Sample research content generator
function generateMockReport(topic: string): ResearchReport {
  return {
    id: generateId(),
    title: `Research: ${topic}`,
    topic,
    content: `This is a comprehensive research report on "${topic}".\n\nKey findings:\n1. The topic has gained significant attention in recent months\n2. There are several trending subtopics worth exploring\n3. Audience engagement is highest with short-form content\n\nRecommendations:\n- Focus on the most engaging aspects\n- Use trending hooks and formats\n- Keep content under 60 seconds for maximum retention`,
    summary: `An in-depth analysis of ${topic} with key insights and recommendations for short-form video content.`,
    sources: [
      'Industry Report 2024',
      'Social Media Trends Analysis',
      'Audience Engagement Study',
    ],
    status: 'completed',
    createdAt: new Date().toISOString(),
  }
}

export const agentService = {
  async startResearch(topic: string): Promise<AgentJob> {
    await delay(300)

    const job: AgentJob = {
      id: generateId(),
      type: 'research',
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    }

    jobs.set(job.id, job)

    // Simulate progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        const report = generateMockReport(topic)
        jobs.set(job.id, {
          ...job,
          status: 'completed',
          progress: 100,
          result: report,
          completedAt: new Date().toISOString(),
        })
      } else {
        jobs.set(job.id, { ...job, progress: Math.floor(progress) })
      }
    }, 500)

    return job
  },

  async getJobStatus(jobId: string): Promise<AgentJob> {
    await delay(100)
    const job = jobs.get(jobId)
    if (!job) {
      throw new Error('Job not found')
    }
    return job
  },
}
