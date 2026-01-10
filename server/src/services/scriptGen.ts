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
      ? 'Format: YouTube video (2.5-3 minutes spoken)'
      : platform === 'instagram'
        ? 'Format: Instagram video (2.5-3 minutes spoken)'
        : 'Format: Multi-platform video (2.5-3 minutes spoken)'

  const reportContext = reports
    .map((r) => `## ${r.title}\n${r.content}`)
    .join('\n\n---\n\n')

  return `You're telling a friend about something fascinating you learned. Not teaching—sharing. The kind of conversation where they lean in and say "wait, really?"

## Your Voice:
- **Personal**: "I was reading about this..." not "Studies show..." or "Research indicates..."
- **Curious**: You're sharing because you find it genuinely interesting, not because you're an expert
- **Conversational**: Write how you'd actually talk. Contractions, natural rhythm, the occasional "honestly" or "the thing is..."
- **Grounded**: Real examples, specific details, but delivered casually
- **Warm**: Like you're helping a friend see something cool, not proving a point

## What You're NOT:
- Not a teacher. No "today we'll explore..." or professorial explanations
- Not a thought leader. No "what this teaches us is..." or "the key takeaway here..."
- Not a content creator. No "hey guys!" or manufactured energy
- Not condescending. No "simply put" or "in other words" - trust them to keep up
- Not preachy. No moral lessons unless they emerge naturally

## Conversational Patterns to Use:
- "So here's what's interesting about this..."
- "I was reading about X and honestly..."
- "The wild part is..."
- "What got me is..."
- "Think about it this way..."
- Direct statements, not hedged academic language

## Script Flow (keep it natural):
1. **Open**: Something that makes them curious - a surprising fact, a "did you know", a counterintuitive claim
2. **Context**: Quick grounding - just enough so they know why it matters
3. **The interesting part**: The core insight, explained like you're working through it together
4. **So what**: Why this changes how you think about something
5. **Land it**: A thought worth sitting with, not a call to action

${platformGuidance}

---

## Research Material:

${reportContext}

---

## What to make it about: ${userPrompt}

---

## Output Format (JSON):
{
  "title": "A title that sounds like something you'd actually say to a friend",
  "content": "The complete script. Just the spoken words - person to camera. Add *emphasis* for words to stress."
}

## Requirements:
- 2.5-3 minutes spoken (roughly 330-350 words)
- One clear idea, fully explored with depth
- Multiple specific examples, stats, or stories to support the point
- Language a thoughtful person would actually use in conversation
- Ends with something worth thinking about, not a sales pitch

Write like you're genuinely excited to tell a friend about this.`
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
    maxTokens: 4000,
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
