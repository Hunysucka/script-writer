import { getProvider } from './ai/provider.js'
import { Report } from '../models/Report.js'
import { Script, type ScriptPlatform } from '../models/Script.js'
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  type Job,
} from '../jobs/jobManager.js'
import mongoose from 'mongoose'

interface ScriptInput {
  reportIds: string[]
  prompt: string
  platform: ScriptPlatform
}

function buildScriptPrompt(
  reports: Array<{ title: string; content: string }>,
  userPrompt: string,
  platform: ScriptPlatform
): string {
  const platformGuidance =
    platform === 'youtube'
      ? 'Create a script for a YouTube Short (under 60 seconds). Use a hook in the first 3 seconds, maintain high energy, and end with a clear takeaway.'
      : platform === 'instagram'
        ? 'Create a script for an Instagram Reel (under 60 seconds). Be visually descriptive, use trendy language, and include a call to action.'
        : 'Create a script that works for both YouTube Shorts and Instagram Reels (under 60 seconds). Balance both platforms\' styles.'

  const reportContext = reports
    .map((r) => `## ${r.title}\n${r.content}`)
    .join('\n\n---\n\n')

  return `You are a professional scriptwriter for short-form video content about economics, finance, and investing.

${platformGuidance}

Based on the following research reports:

${reportContext}

---

User's request: ${userPrompt}

Please provide your response in the following JSON format:
{
  "title": "A catchy title for the video",
  "content": "The full script with speaker directions in [brackets] and emphasis in *asterisks*"
}

The script should:
- Hook the viewer immediately
- Present one clear, valuable insight
- Use conversational, engaging language
- Be speakable in under 60 seconds
- End with impact (takeaway, question, or call to action)`
}

function parseScriptResponse(response: string): {
  title: string
  content: string
} {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || 'Untitled Script',
        content: parsed.content || response,
      }
    }
  } catch {
    // If JSON parsing fails, use the raw response
  }

  return {
    title: 'Untitled Script',
    content: response,
  }
}

export async function startScriptGeneration(input: ScriptInput): Promise<Job> {
  const job = createJob('script')

  // Run generation in background
  runScriptGeneration(job.id, input).catch((error) => {
    console.error('Script generation error:', error)
    failJob(job.id, error.message)
  })

  return job
}

async function runScriptGeneration(
  jobId: string,
  input: ScriptInput
): Promise<void> {
  updateJob(jobId, { status: 'running', progress: 10 })

  // Fetch reports
  const reportIds = input.reportIds.map(
    (id) => new mongoose.Types.ObjectId(id)
  )
  const reports = await Report.find({ _id: { $in: reportIds } })

  if (reports.length === 0) {
    throw new Error('No reports found')
  }

  updateJob(jobId, { progress: 30 })

  const provider = getProvider()
  const prompt = buildScriptPrompt(
    reports.map((r) => ({ title: r.title, content: r.content })),
    input.prompt,
    input.platform
  )

  updateJob(jobId, { progress: 50 })

  const response = await provider.complete(prompt, {
    maxTokens: 2048,
    temperature: 0.8,
  })

  updateJob(jobId, { progress: 80 })

  const parsed = parseScriptResponse(response)

  // Save to database
  const script = new Script({
    title: parsed.title,
    content: parsed.content,
    platform: input.platform,
    reportIds: reportIds,
    prompt: input.prompt,
    status: 'draft',
  })

  await script.save()

  completeJob(jobId, script.toObject())
}
