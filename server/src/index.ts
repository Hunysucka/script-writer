import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import agentsRouter from './routes/agents.js'
import reportsRouter from './routes/reports.js'
import scriptsRouter from './routes/scripts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/agents', agentsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/scripts', scriptsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client-dist')
  app.use(express.static(clientDist))
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Error handler
app.use(errorHandler)

// Start server
async function start() {
  await connectDB()

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`)
  })
}

start().catch(console.error)
