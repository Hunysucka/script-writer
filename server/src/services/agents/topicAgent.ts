import { getProvider } from '../ai/provider.js'
import { Report } from '../../models/Report.js'
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  type Job,
} from '../../jobs/jobManager.js'
import { webSearch, searchAuthoritativeSources } from '../tools/webSearch.js'

interface TopicResearchInput {
  topic: string
  depth?: 'overview' | 'comprehensive'
}

interface GatheredTopicResearch {
  authoritativeResults: Array<{
    query: string
    results: Array<{ title: string; url: string; content: string }>
    answer?: string
  }>
  generalResults: Array<{
    query: string
    results: Array<{ title: string; url: string; content: string }>
    answer?: string
  }>
  errors: string[]
}

async function gatherTopicResearch(
  topic: string
): Promise<GatheredTopicResearch> {
  const research: GatheredTopicResearch = {
    authoritativeResults: [],
    generalResults: [],
    errors: [],
  }

  // Authoritative source searches (academic, established institutions)
  const authoritativeDomains = [
    'wikipedia.org',
    'britannica.com',
    'investopedia.com',
    'economist.com',
    'hbr.org',
    'nber.org',
    'federalreserve.gov',
    'imf.org',
    'worldbank.org',
    'stanford.edu',
    'mit.edu',
    'harvard.edu',
  ]

  const authoritativeQueries = [
    `${topic} definition explanation`,
    `${topic} history origin development`,
    `${topic} key concepts principles`,
  ]

  // General searches for broader perspective
  const generalQueries = [
    `${topic} how it works mechanism`,
    `${topic} examples case studies`,
    `${topic} experts leading thinkers`,
    `${topic} criticism debate controversy`,
    `${topic} practical applications implications`,
    `${topic} common misconceptions mistakes`,
    `${topic} best books resources`,
  ]

  // Execute authoritative searches
  const authoritativePromises = authoritativeQueries.map(async (query) => {
    try {
      const result = await searchAuthoritativeSources(query, {
        domains: authoritativeDomains,
        maxResults: 5,
      })
      return {
        query,
        results: result.results,
        answer: result.answer,
      }
    } catch (error) {
      research.errors.push(
        `Authoritative search failed for "${query}": ${error}`
      )
      return null
    }
  })

  // Execute general searches
  const generalPromises = generalQueries.map(async (query) => {
    try {
      const result = await webSearch(query, {
        maxResults: 5,
        searchDepth: 'advanced',
        includeAnswer: true,
        excludeDomains: ['pinterest.com', 'quora.com', 'reddit.com'], // Exclude low-quality sources
      })
      return {
        query,
        results: result.results,
        answer: result.answer,
      }
    } catch (error) {
      research.errors.push(`General search failed for "${query}": ${error}`)
      return null
    }
  })

  // Wait for all searches
  const [authResults, genResults] = await Promise.all([
    Promise.all(authoritativePromises),
    Promise.all(generalPromises),
  ])

  research.authoritativeResults = authResults.filter(
    (r): r is NonNullable<typeof r> => r !== null
  )
  research.generalResults = genResults.filter(
    (r): r is NonNullable<typeof r> => r !== null
  )

  return research
}

function buildTopicPrompt(
  topic: string,
  gatheredResearch: GatheredTopicResearch
): string {
  // Format authoritative results
  const authoritativeContext = gatheredResearch.authoritativeResults
    .map((search) => {
      const resultsText = search.results
        .map((r) => `**${r.title}** (${r.url})\n${r.content}`)
        .join('\n\n')
      return `### ${search.query}
${search.answer ? `**Key Finding**: ${search.answer}\n` : ''}
${resultsText}`
    })
    .join('\n\n---\n\n')

  // Format general results
  const generalContext = gatheredResearch.generalResults
    .map((search) => {
      const resultsText = search.results
        .map((r) => `**${r.title}** (${r.url})\n${r.content}`)
        .join('\n\n')
      return `### ${search.query}
${search.answer ? `**Summary**: ${search.answer}\n` : ''}
${resultsText}`
    })
    .join('\n\n---\n\n')

  return `You are a research synthesizer and educator specializing in making complex topics accessible without sacrificing depth. Your expertise is in taking disparate sources and weaving them into a coherent, authoritative guide.

## Your Mission
Create a comprehensive, definitive primer on "${topic}" using the research materials below. This should be the single best resource someone could read to understand this topic deeply and practically.

## Research Materials

### From Authoritative Sources (Academic, Institutional)
${authoritativeContext}

### From General Sources
${generalContext}

---

## Report Structure

### 1. EXECUTIVE SUMMARY
The essence of this topic in 3-4 sentences:
- What is it?
- Why does it matter?
- What's the single most important thing to understand?

### 2. DEFINITION & CORE CONCEPT
Explain this like you're teaching a smart person who's never encountered it:
- **Plain English Definition**: No jargon, no assumptions
- **Technical Definition**: The precise, formal understanding
- **The Key Insight**: What's the "aha" that makes this click?
- **Common Confusions**: What this is NOT (clear up misconceptions)

### 3. ORIGIN & HISTORY
Where did this come from?
- Who developed or discovered this? When and why?
- What problem was it created to solve?
- Key milestones in its evolution
- How has understanding of this changed over time?

### 4. HOW IT WORKS (The Mechanism)
Explain the machinery:
- **First Principles**: What are the foundational truths underlying this?
- **Components**: Break it into 4-6 essential parts
- **The Process**: Step-by-step how it functions
- **Cause and Effect**: What happens when X, then Y?
- **Visual/Mental Model**: If someone needed to picture this, how should they?

### 5. KEY CONCEPTS & TERMINOLOGY
Build the vocabulary:
- 6-10 essential terms anyone discussing this topic must know
- For each: definition, why it matters, example of use
- Relationships between concepts (how they connect)

### 6. REAL-WORLD EXAMPLES
Make it concrete:
- 3-5 specific cases where this plays out
- Historical examples that illustrate key points
- Current/contemporary examples
- Both successes and failures if applicable

### 7. KEY FIGURES & THINKERS
Who shaped understanding of this topic?
- 5-8 essential people to know
- Their specific contribution
- Their key work (books, papers, speeches)
- Quotes that capture their perspective

### 8. DEBATES & CONTROVERSIES
Where is there disagreement?
- Major schools of thought and how they differ
- Open questions that experts still debate
- Common criticisms and counterarguments
- What we still don't know

### 9. PRACTICAL APPLICATIONS
Make it useful:
- How can someone apply this knowledge?
- What decisions does understanding this inform?
- Common mistakes to avoid
- Best practices based on this understanding

### 10. GOING DEEPER
For continued learning:
- **Essential Reading**: 3-5 best books (with why each matters)
- **Key Papers/Articles**: Foundational academic work
- **Other Resources**: Podcasts, courses, websites
- **Suggested Learning Path**: Where to start, where to go next

## Output Format (JSON)
{
  "title": "Deep Dive: ${topic} - [Subtitle capturing the core insight]",
  "summary": "2-3 sentences: What is this, why it matters, and the key takeaway",
  "content": "Full markdown report following the structure above",
  "sources": ["All URLs and sources used in the research"]
}

## Quality Standards
- **Authority**: Lean on credible sources. Cite them.
- **Accessibility**: Complex ideas made clear, never dumbed down
- **Completeness**: Cover all 10 sections with real substance
- **Precision**: Specific facts, figures, names, dates. No vague gestures.
- **Practical Value**: Someone should be able to USE this knowledge
- **Intellectual Honesty**: Include debates, limitations, unknowns

Create the most thorough, accurate, and useful topic guide possible.`
}

function parseTopicResponse(response: string): {
  title: string
  summary: string
  content: string
  sources: string[]
} {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || 'Topic Research',
        summary: parsed.summary || '',
        content: parsed.content || response,
        sources: parsed.sources || [],
      }
    }
  } catch {
    // If JSON parsing fails, use the raw response
  }

  return {
    title: 'Topic Research',
    summary: response.slice(0, 200) + '...',
    content: response,
    sources: [],
  }
}

export async function startTopicResearch(
  input: TopicResearchInput
): Promise<Job> {
  const job = createJob('research')

  runTopicResearch(job.id, input).catch((error) => {
    console.error('Topic research error:', error)
    failJob(job.id, error.message)
  })

  return job
}

async function runTopicResearch(
  jobId: string,
  input: TopicResearchInput
): Promise<void> {
  updateJob(jobId, { status: 'running', progress: 5 })

  // Phase 1: Gather research from web (40% of progress)
  updateJob(jobId, { progress: 10 })
  const gatheredResearch = await gatherTopicResearch(input.topic)

  updateJob(jobId, { progress: 40 })

  // Phase 2: Synthesize with AI (50% of progress)
  const provider = getProvider()
  const prompt = buildTopicPrompt(input.topic, gatheredResearch)

  updateJob(jobId, { progress: 50 })

  const response = await provider.complete(prompt, {
    maxTokens: 8000,
    temperature: 0.7,
  })

  updateJob(jobId, { progress: 85 })

  // Phase 3: Save results
  const parsed = parseTopicResponse(response)

  // Collect all sources
  const allSources = [
    ...parsed.sources,
    ...gatheredResearch.authoritativeResults.flatMap((s) =>
      s.results.map((r) => r.url)
    ),
    ...gatheredResearch.generalResults.flatMap((s) =>
      s.results.map((r) => r.url)
    ),
  ]

  const report = new Report({
    title: parsed.title,
    researchType: 'topic',
    topic: input.topic,
    content: parsed.content,
    summary: parsed.summary,
    sources: [...new Set(allSources)], // Dedupe
  })

  await report.save()

  completeJob(jobId, report.toObject())
}
