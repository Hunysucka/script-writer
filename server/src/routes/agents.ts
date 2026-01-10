import { Router, type Request, type Response } from 'express'
import { startResearch } from '../services/research.js'
import { startScriptGeneration } from '../services/scriptGen.js'
import { getJob } from '../jobs/jobManager.js'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

// Start research job
router.post('/research', async (req: Request, res: Response) => {
  const { type, bookTitle, authorName, topic } = req.body

  if (!type || !['book', 'author', 'topic'].includes(type)) {
    throw createError('Invalid research type', 400)
  }

  if (type === 'book' && !bookTitle) {
    throw createError('Book title is required', 400)
  }

  if (type === 'author' && !authorName) {
    throw createError('Author name is required', 400)
  }

  if (type === 'topic' && !topic) {
    throw createError('Topic is required', 400)
  }

  const job = await startResearch({ type, bookTitle, authorName, topic })

  res.status(202).json({
    jobId: job.id,
    status: job.status,
  })
})

// Start script generation job
router.post('/script', async (req: Request, res: Response) => {
  const { reportIds, prompt, platform } = req.body

  if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
    throw createError('At least one report ID is required', 400)
  }

  if (!prompt) {
    throw createError('Prompt is required', 400)
  }

  if (!platform || !['youtube', 'instagram', 'both'].includes(platform)) {
    throw createError('Invalid platform', 400)
  }

  const job = await startScriptGeneration({ reportIds, prompt, platform })

  res.status(202).json({
    jobId: job.id,
    status: job.status,
  })
})

// Get job status
router.get('/:jobId/status', (req: Request, res: Response) => {
  const { jobId } = req.params
  const job = getJob(jobId)

  if (!job) {
    throw createError('Job not found', 404)
  }

  res.json({
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  })
})

export default router
