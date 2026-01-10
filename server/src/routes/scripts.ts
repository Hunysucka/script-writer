import { Router, type Request, type Response } from 'express'
import { Script } from '../models/Script.js'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

// List all scripts
router.get('/', async (req: Request, res: Response) => {
  const { search } = req.query

  let query = {}
  if (search && typeof search === 'string') {
    query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    }
  }

  const scripts = await Script.find(query).sort({ updatedAt: -1 })

  res.json(scripts)
})

// Get single script
router.get('/:id', async (req: Request, res: Response) => {
  const script = await Script.findById(req.params.id)

  if (!script) {
    throw createError('Script not found', 404)
  }

  res.json(script)
})

// Update script
router.patch('/:id', async (req: Request, res: Response) => {
  const { title, content, status } = req.body

  const script = await Script.findByIdAndUpdate(
    req.params.id,
    { title, content, status },
    { new: true, runValidators: true }
  )

  if (!script) {
    throw createError('Script not found', 404)
  }

  res.json(script)
})

// Delete script
router.delete('/:id', async (req: Request, res: Response) => {
  const script = await Script.findByIdAndDelete(req.params.id)

  if (!script) {
    throw createError('Script not found', 404)
  }

  res.status(204).send()
})

export default router
