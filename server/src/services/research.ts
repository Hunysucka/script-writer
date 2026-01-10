import { getProvider } from './ai/provider.js'
import { Report, type ResearchType } from '../models/Report.js'
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  type Job,
} from '../jobs/jobManager.js'

interface ResearchInput {
  type: ResearchType
  bookTitle?: string
  authorName?: string
  topic?: string
}

function buildResearchPrompt(input: ResearchInput): string {
  const baseContext = `You are a research assistant specializing in economics, markets, investing, and personal finance.
Your task is to create a comprehensive research report that will be used to generate educational video scripts.

Please provide your response in the following JSON format:
{
  "title": "A compelling title for the report",
  "summary": "A 2-3 sentence summary of the key insights",
  "content": "The full markdown content of the report (use ## for sections, bullet points, etc.)",
  "sources": ["List of sources and references"]
}

The report should include:
- Key concepts and ideas
- Historical context if relevant
- Practical applications and insights
- Notable quotes or examples
- Connections to current events or trends

`

  if (input.type === 'book') {
    return `${baseContext}
Research the book "${input.bookTitle}"${input.authorName ? ` by ${input.authorName}` : ''}.

Focus on:
- The main thesis and key arguments
- Chapter summaries and core concepts
- The author's background and credibility
- Critical reception and impact
- Key takeaways for readers interested in finance/economics`
  }

  if (input.type === 'author') {
    return `${baseContext}
Research the author "${input.authorName}".

Focus on:
- Their background and expertise
- Major works and contributions
- Key ideas and philosophies
- Influence on economics/finance/investing
- Notable quotes and teachings`
  }

  // topic
  return `${baseContext}
Research the topic "${input.topic}".

Focus on:
- Definition and core concepts
- Historical development
- Key thinkers and contributors
- Practical applications
- Current relevance and debates`
}

function parseResearchResponse(response: string): {
  title: string
  summary: string
  content: string
  sources: string[]
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || 'Research Report',
        summary: parsed.summary || '',
        content: parsed.content || response,
        sources: parsed.sources || [],
      }
    }
  } catch {
    // If JSON parsing fails, use the raw response
  }

  return {
    title: 'Research Report',
    summary: response.slice(0, 200) + '...',
    content: response,
    sources: [],
  }
}

export async function startResearch(input: ResearchInput): Promise<Job> {
  const job = createJob('research')

  // Run research in background
  runResearch(job.id, input).catch((error) => {
    console.error('Research error:', error)
    failJob(job.id, error.message)
  })

  return job
}

async function runResearch(jobId: string, input: ResearchInput): Promise<void> {
  updateJob(jobId, { status: 'running', progress: 10 })

  const provider = getProvider()
  const prompt = buildResearchPrompt(input)

  updateJob(jobId, { progress: 30 })

  const response = await provider.complete(prompt, {
    maxTokens: 4096,
    temperature: 0.7,
  })

  updateJob(jobId, { progress: 70 })

  const parsed = parseResearchResponse(response)

  // Save to database
  const report = new Report({
    title: parsed.title,
    researchType: input.type,
    bookTitle: input.bookTitle,
    authorName: input.authorName,
    topic: input.topic,
    content: parsed.content,
    summary: parsed.summary,
    sources: parsed.sources,
  })

  await report.save()

  updateJob(jobId, { progress: 90 })

  completeJob(jobId, report.toObject())
}
