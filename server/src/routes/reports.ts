import { Router, type Request, type Response } from 'express'
import { Report } from '../models/Report.js'
import { createError } from '../middleware/errorHandler.js'
import { convertStructuredToMarkdown, isJsonContent, parseJsonContent } from '../services/reportConverter.js'

const router = Router()

async function migrateReportIfNeeded(report: InstanceType<typeof Report>): Promise<void> {
  if (report.structuredContent) return
  
  if (isJsonContent(report.content)) {
    const parsed = parseJsonContent(report.content)
    if (parsed) {
      report.structuredContent = parsed
      report.content = convertStructuredToMarkdown(parsed)
      await report.save()
    }
  }
}

// List all reports
router.get('/', async (req: Request, res: Response) => {
  const { search } = req.query

  let query = {}
  if (search && typeof search === 'string') {
    query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { bookTitle: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ],
    }
  }

  const reports = await Report.find(query).sort({ createdAt: -1 })

  for (const report of reports) {
    await migrateReportIfNeeded(report)
  }

  res.json(reports)
})

// Get single report
router.get('/:id', async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id)

  if (!report) {
    throw createError('Report not found', 404)
  }

  await migrateReportIfNeeded(report)

  res.json(report)
})

// Update report
router.patch('/:id', async (req: Request, res: Response) => {
  const { title, content, summary } = req.body

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { title, content, summary },
    { new: true, runValidators: true }
  )

  if (!report) {
    throw createError('Report not found', 404)
  }

  res.json(report)
})

// Delete report
router.delete('/:id', async (req: Request, res: Response) => {
  const report = await Report.findByIdAndDelete(req.params.id)

  if (!report) {
    throw createError('Report not found', 404)
  }

  res.status(204).send()
})

export default router
