import { v4 as uuidv4 } from 'uuid'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'
export type JobType = 'research' | 'script'

export interface Job {
  id: string
  type: JobType
  status: JobStatus
  progress: number
  result?: unknown
  error?: string
  startedAt: Date
  completedAt?: Date
}

// In-memory job storage (upgrade to Redis for production)
const jobs = new Map<string, Job>()

export function createJob(type: JobType): Job {
  const job: Job = {
    id: uuidv4(),
    type,
    status: 'pending',
    progress: 0,
    startedAt: new Date(),
  }
  jobs.set(job.id, job)
  return job
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id)
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id)
  if (!job) return undefined

  const updated = { ...job, ...updates }
  jobs.set(id, updated)
  return updated
}

export function completeJob(id: string, result: unknown): Job | undefined {
  return updateJob(id, {
    status: 'completed',
    progress: 100,
    result,
    completedAt: new Date(),
  })
}

export function failJob(id: string, error: string): Job | undefined {
  return updateJob(id, {
    status: 'failed',
    error,
    completedAt: new Date(),
  })
}

// Clean up old jobs (run periodically)
export function cleanupJobs(maxAgeMs: number = 3600000): void {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (job.completedAt && now - job.completedAt.getTime() > maxAgeMs) {
      jobs.delete(id)
    }
  }
}
