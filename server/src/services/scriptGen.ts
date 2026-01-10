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
      ? 'Format: YouTube Short (under 60 seconds spoken aloud)'
      : platform === 'instagram'
        ? 'Format: Instagram Reel (under 60 seconds spoken aloud)'
        : 'Format: Multi-platform short (under 60 seconds spoken aloud)'

  const reportContext = reports
    .map((r) => `## ${r.title}\n${r.content}`)
    .join('\n\n---\n\n')

  return `You are a scriptwriter channeling the voice of a calm, authoritative teacher—think Ray Dalio explaining economic principles or Warren Buffett sharing investment wisdom. Your audience ranges from curious beginners to knowledgeable intermediates who want substance, not hype.

## Your Voice:
- **Calm authority**: Measured, thoughtful, wise. Never rushed or hyper.
- **Intellectually honest**: Acknowledge complexity. No oversimplification.
- **Precision**: Specific language. Say exactly what you mean.
- **Accessible depth**: Complex ideas made clear, but never dumbed down.
- **No fluff**: Every sentence earns its place.

## What You're NOT:
- Not a hype man. No "HUGE!" or "INSANE!" or "You won't BELIEVE..."
- Not clickbait. No manufactured controversy or false urgency.
- Not condescending. Respect your audience's intelligence.
- Not generic. No "In today's video..." or "Hey guys!"

## Script Structure for Deep Dive Style:
1. **The Hook (3-5 sec)**: A thought-provoking question, surprising fact, or counterintuitive claim that earns attention
2. **Context (10-15 sec)**: Brief grounding—why this matters, what's the bigger picture
3. **The Core Insight (25-30 sec)**: The main idea, explained with precision and a concrete example
4. **The Implication (10-15 sec)**: So what? What does this mean for how we think or act?
5. **The Close (5 sec)**: A resonant final thought—not a call to action, but something worth sitting with

${platformGuidance}

---

## Research Material:

${reportContext}

---

## User's Request: ${userPrompt}

---

## Output Format (JSON):
{
  "title": "A precise, intriguing title (not clickbait—think documentary, not tabloid)",
  "content": "The complete script with [VISUAL/ACTION NOTES] in brackets and *emphasis* for key words"
}

## Script Requirements:
- Speakable in under 60 seconds (roughly 140-160 words)
- One clear, substantive idea—fully developed
- At least one specific example, number, or quote
- Language a thoughtful 25-year-old would use
- Ends with resonance, not a sales pitch

Write like someone who has spent years thinking about this and is sharing what they've learned.`
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
