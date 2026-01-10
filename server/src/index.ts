import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import agentsRouter from './routes/agents.js'
import reportsRouter from './routes/reports.js'
import scriptsRouter from './routes/scripts.js'

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
