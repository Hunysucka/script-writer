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
import { getYouTubeTranscript, getMultipleTranscripts } from '../tools/youtube.js'

interface AuthorResearchInput {
  authorName: string
  focusTopics?: string[]
}

interface GatheredResearch {
  webSearchResults: Array<{
    query: string
    results: Array<{ title: string; url: string; content: string }>
    answer?: string
  }>
  youtubeTranscripts: Array<{
    videoId: string
    transcript: string
    source: string
  }>
  errors: string[]
}

async function gatherAuthorResearch(
  authorName: string,
  focusTopics: string[] = []
): Promise<GatheredResearch> {
  const research: GatheredResearch = {
    webSearchResults: [],
    youtubeTranscripts: [],
    errors: [],
  }

  // Build search queries for comprehensive author coverage
  const searchQueries = [
    `${authorName} philosophy ideas worldview`,
    `${authorName} best quotes interviews`,
    `${authorName} books main arguments key concepts`,
    `${authorName} biography background what shaped thinking`,
    `${authorName} controversial opinions debates`,
    ...focusTopics.map((topic) => `${authorName} on ${topic}`),
  ]

  // YouTube search queries to find video content
  const youtubeSearchQueries = [
    `${authorName} interview site:youtube.com`,
    `${authorName} lecture talk site:youtube.com`,
    `${authorName} podcast conversation site:youtube.com`,
  ]

  // Execute web searches in parallel
  const webSearchPromises = searchQueries.map(async (query) => {
    try {
      const result = await webSearch(query, {
        maxResults: 5,
        searchDepth: 'advanced',
        includeAnswer: true,
      })
      return {
        query,
        results: result.results,
        answer: result.answer,
      }
    } catch (error) {
      research.errors.push(`Web search failed for "${query}": ${error}`)
      return null
    }
  })

  // Execute YouTube-focused searches to find video URLs
  const youtubeSearchPromises = youtubeSearchQueries.map(async (query) => {
    try {
      const result = await webSearch(query, {
        maxResults: 3,
        searchDepth: 'basic',
        includeDomains: ['youtube.com', 'youtu.be'],
      })
      return result.results
    } catch (error) {
      research.errors.push(`YouTube search failed: ${error}`)
      return []
    }
  })

  // Wait for all web searches
  const webResults = await Promise.all(webSearchPromises)
  research.webSearchResults = webResults.filter(
    (r): r is NonNullable<typeof r> => r !== null
  )

  // Extract YouTube URLs from search results
  const youtubeResults = await Promise.all(youtubeSearchPromises)
  const youtubeUrls = youtubeResults
    .flat()
    .filter((r) => r.url.includes('youtube.com') || r.url.includes('youtu.be'))
    .slice(0, 5) // Limit to 5 videos

  // Fetch transcripts for found videos
  if (youtubeUrls.length > 0) {
    const transcriptResults = await getMultipleTranscripts(
      youtubeUrls.map((r) => r.url)
    )

    for (let i = 0; i < transcriptResults.length; i++) {
      const result = transcriptResults[i]
      if ('transcript' in result) {
        research.youtubeTranscripts.push({
          videoId: result.videoId,
          transcript: result.transcript,
          source: youtubeUrls[i].url,
        })
      } else {
        research.errors.push(`Transcript unavailable: ${result.error}`)
      }
    }
  }

  return research
}

function buildAuthorPrompt(
  authorName: string,
  gatheredResearch: GatheredResearch
): string {
  // Format web search results
  const webContext = gatheredResearch.webSearchResults
    .map((search) => {
      const resultsText = search.results
        .map((r) => `**${r.title}**\n${r.content}`)
        .join('\n\n')
      return `### Search: "${search.query}"
${search.answer ? `**Summary**: ${search.answer}\n` : ''}
${resultsText}`
    })
    .join('\n\n---\n\n')

  // Format YouTube transcripts
  const youtubeContext =
    gatheredResearch.youtubeTranscripts.length > 0
      ? gatheredResearch.youtubeTranscripts
          .map(
            (t) =>
              `### Video Transcript (${t.source})\n${t.transcript.slice(0, 3000)}${t.transcript.length > 3000 ? '...[truncated]' : ''}`
          )
          .join('\n\n---\n\n')
      : 'No video transcripts available.'

  return `You are an intellectual biographer and thought analyst. Your specialty is creating comprehensive profiles of thinkers—mapping their ideas, understanding their intellectual evolution, and extracting actionable wisdom from their body of work.

## Your Mission
Create a definitive intellectual profile of ${authorName} using the research materials provided below. This profile should serve as the go-to reference for understanding who this person is intellectually, what they believe, and why their ideas matter.

## Research Materials Gathered

### Web Search Results
${webContext}

### YouTube/Video Content
${youtubeContext}

---

## Profile Structure

### 1. INTELLECTUAL IDENTITY
Who is this thinker at their core?
- **The One Sentence**: If you had to capture their entire worldview in one sentence, what would it be?
- **Core Mission**: What problem are they trying to solve for humanity?
- **Intellectual DNA**: What 2-3 foundational beliefs shape everything they think?

### 2. FORMATIVE STORY
Biography that matters—not dates, but the experiences that shaped their mind:
- Key life experiences that forged their worldview
- Intellectual turning points or "aha moments"
- Mentors, rivals, and pivotal relationships
- Failures or crises that shaped their thinking

### 3. INTELLECTUAL FRAMEWORK
Map their mental operating system:
- **First Principles**: What are their foundational assumptions about the world?
- **Key Models**: What frameworks or mental models do they use repeatedly?
- **Signature Ideas**: The 5-7 concepts most associated with their thinking
  - For each: What is it? Why does it matter? How do they apply it?

### 4. THEIR VOICE (Direct Quotes)
Capture how they actually think and speak:
- 8-12 powerful quotes that reveal their philosophy
- Include context for each quote when available
- Organize by theme (on success, on failure, on human nature, etc.)
- Note the source (book, interview, speech)

### 5. CONVERSATIONS & DEBATES
What do they talk about when in dialogue with others?
- Key topics they return to in interviews
- How they respond to pushback or disagreement
- Memorable exchanges or debates
- Evolution of their positions over time

### 6. INTELLECTUAL LANDSCAPE
Where do they fit in the broader world of ideas?
- **Influences**: Who shaped their thinking? What books changed them?
- **Allies**: Who do they agree with? Cite approvingly?
- **Opponents**: Who do they disagree with? Why?
- **Legacy**: Who have they influenced? What movements or people cite them?

### 7. CONTROVERSIES & CRITIQUES
Present the full picture:
- Where do they clash with mainstream opinion?
- What are the strongest arguments against their views?
- Where have they been wrong or changed their mind?
- Blindspots or limitations in their worldview

### 8. PRACTICAL WISDOM
Make it actionable for someone learning from this thinker:
- What specific advice do they give?
- What should someone studying them do differently in their life?
- What warnings or cautions do they offer?
- If someone had 30 minutes with them, what should they ask?

### 9. ENTRY POINTS
For someone wanting to go deeper:
- Best book to start with (and why)
- Best interview or talk to watch
- Best article or essay
- Recommended reading order for their work

## Output Format (JSON)
{
  "title": "Intellectual Profile: ${authorName} - [Subtitle capturing their core contribution]",
  "summary": "2-3 sentences on who this thinker is and why their ideas matter",
  "content": "Full markdown profile following the structure above",
  "sources": ["List all sources used: URLs, video titles, book titles"]
}

## Quality Standards
- **Authentic Voice**: Use their actual words and ideas, not generic summaries
- **Intellectual Honesty**: Present both strengths and weaknesses fairly
- **Practical Utility**: Someone should be able to apply their ideas after reading this
- **Depth Over Breadth**: Better to go deep on key ideas than shallow on many
- **Living Document Feel**: This should feel like a map to a living body of thought

Create the most comprehensive, nuanced, and useful author profile possible.`
}

function parseAuthorResponse(response: string): {
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
        title: parsed.title || 'Author Profile',
        summary: parsed.summary || '',
        content: parsed.content || response,
        sources: parsed.sources || [],
      }
    }
  } catch {
    // If JSON parsing fails, use the raw response
  }

  return {
    title: 'Author Profile',
    summary: response.slice(0, 200) + '...',
    content: response,
    sources: [],
  }
}

export async function startAuthorResearch(
  input: AuthorResearchInput
): Promise<Job> {
  const job = createJob('research')

  runAuthorResearch(job.id, input).catch((error) => {
    console.error('Author research error:', error)
    failJob(job.id, error.message)
  })

  return job
}

async function runAuthorResearch(
  jobId: string,
  input: AuthorResearchInput
): Promise<void> {
  updateJob(jobId, { status: 'running', progress: 5 })

  // Phase 1: Gather research from web and YouTube (40% of progress)
  updateJob(jobId, { progress: 10 })
  const gatheredResearch = await gatherAuthorResearch(
    input.authorName,
    input.focusTopics
  )

  updateJob(jobId, { progress: 40 })

  // Phase 2: Synthesize with AI (50% of progress)
  const provider = getProvider()
  const prompt = buildAuthorPrompt(input.authorName, gatheredResearch)

  updateJob(jobId, { progress: 50 })

  const response = await provider.complete(prompt, {
    maxTokens: 8000,
    temperature: 0.7,
  })

  updateJob(jobId, { progress: 85 })

  // Phase 3: Save results
  const parsed = parseAuthorResponse(response)

  // Add gathered sources to the sources list
  const allSources = [
    ...parsed.sources,
    ...gatheredResearch.youtubeTranscripts.map((t) => t.source),
    ...gatheredResearch.webSearchResults.flatMap((s) =>
      s.results.map((r) => r.url)
    ),
  ]

  const report = new Report({
    title: parsed.title,
    researchType: 'author',
    authorName: input.authorName,
    content: parsed.content,
    summary: parsed.summary,
    sources: [...new Set(allSources)], // Dedupe sources
  })

  await report.save()

  completeJob(jobId, report.toObject())
}
