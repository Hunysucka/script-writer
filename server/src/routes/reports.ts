import { Router, type Request, type Response } from 'express'
import { Report } from '../models/Report.js'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

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

  res.json(reports)
})

// Get single report
router.get('/:id', async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id)

  if (!report) {
    throw createError('Report not found', 404)
  }

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
