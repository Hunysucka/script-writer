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
  const baseContext = `You are a world-class research analyst with deep expertise in economics, markets, investing, and personal finance. Your research will be used to create educational video content for an audience ranging from curious beginners to knowledgeable intermediates.

Your task is to produce an EXHAUSTIVE, DEEPLY-RESEARCHED report that extracts maximum insight within token limits. Do not skim the surface—dig into the substance.

## Research Standards:
1. **Precision over generality**: Specific facts, figures, dates, and examples. No vague statements.
2. **First-principles thinking**: Explain WHY things work, not just what they are.
3. **Historical grounding**: How did we get here? What's the origin story?
4. **Practical wisdom**: What does this mean for someone's actual decisions?
5. **Intellectual honesty**: Include counterarguments, limitations, and nuance.
6. **Memorable specifics**: Concrete anecdotes, quotes, and case studies that stick.

## Output Format (JSON):
{
  "title": "A precise, substantive title (not clickbait)",
  "summary": "2-3 sentences capturing the single most important insight",
  "content": "Full markdown report (detailed below)",
  "sources": ["Specific sources: books, papers, speeches, with authors/dates when possible"]
}

## Content Structure:
Use markdown with ## headers. Include:
- **Core Thesis**: The central idea in one clear paragraph
- **Historical Context**: Origin, evolution, key milestones
- **Key Concepts**: Break down the 3-5 most important ideas with depth
- **Evidence & Examples**: Specific case studies, data points, real-world applications
- **Key Figures**: Who shaped this thinking? Their specific contributions.
- **Counterarguments**: Legitimate criticisms and limitations
- **Practical Implications**: What should someone actually DO with this knowledge?
- **Notable Quotes**: 3-5 memorable quotes with attribution
- **Further Reading**: Specific recommendations for deeper exploration

Be thorough. Be precise. Be useful.

`

  if (input.type === 'book') {
    return `${baseContext}
## Research Assignment: Book Analysis

Analyze "${input.bookTitle}"${input.authorName ? ` by ${input.authorName}` : ''}.

Go beyond surface-level summary. Extract:

1. **The Core Argument**: What is the author's central thesis? Why does it matter?
2. **Intellectual Lineage**: What ideas influenced this book? What school of thought?
3. **Key Concepts**: The 5-7 most important ideas, explained with precision
4. **Memorable Examples**: Specific stories, case studies, or data the author uses
5. **The Author's Credentials**: Why should we trust this person on this topic?
6. **Critical Reception**: What do supporters AND critics say?
7. **Timeless vs. Dated**: What still holds up? What hasn't aged well?
8. **Actionable Takeaways**: What should a reader actually change about their thinking or behavior?
9. **Best Quotes**: 5-7 quotes that capture the book's essence

This report should give someone 80% of the book's value without reading it, while making them want to read it for the remaining 20%.`
  }

  if (input.type === 'author') {
    return `${baseContext}
## Research Assignment: Author Deep Dive

Create a comprehensive intellectual profile of "${input.authorName}".

Map their complete intellectual contribution:

1. **Biography That Matters**: Not just dates—what experiences shaped their thinking?
2. **Intellectual Framework**: What is their worldview? First principles?
3. **Major Works**: Their most important books/papers with specific contributions of each
4. **Key Ideas**: The 5-7 concepts they're most known for, explained with depth
5. **Evolution**: How has their thinking changed over time?
6. **Influence Map**: Who influenced them? Who have they influenced?
7. **Controversies**: Where do they clash with mainstream thinking? Why?
8. **Practical Applications**: How can their ideas be applied today?
9. **Essential Quotes**: 7-10 quotes that capture their philosophy
10. **Reading Order**: If someone wants to understand this thinker, where should they start?

Create a portrait of a mind, not just a list of accomplishments.`
  }

  // topic
  return `${baseContext}
## Research Assignment: Concept Deep Dive

Produce a definitive primer on "${input.topic}".

Build understanding from the ground up:

1. **Definition**: What is this, precisely? (Not a dictionary definition—a real explanation)
2. **Why It Matters**: What problem does understanding this solve?
3. **Origin Story**: Where did this concept come from? Who developed it?
4. **First Principles**: What are the foundational truths underlying this concept?
5. **Key Components**: Break it into 4-6 essential parts, each explained thoroughly
6. **How It Works**: The mechanism—cause and effect, step by step
7. **Real-World Examples**: 3-5 specific cases where this plays out
8. **Common Misconceptions**: What do people get wrong about this?
9. **Debates & Controversies**: Where do experts disagree?
10. **Practical Application**: How does someone use this knowledge?
11. **Key Figures**: Who are the essential thinkers to know?
12. **Further Study**: Specific books, papers, resources for going deeper

Make complex ideas accessible without dumbing them down.`
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
