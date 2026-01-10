import { getProvider } from '../ai/provider.js'
import { Report } from '../../models/Report.js'
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  type Job,
} from '../../jobs/jobManager.js'

interface BookResearchInput {
  bookTitle: string
  authorName?: string
}

function buildBookPrompt(input: BookResearchInput): string {
  const bookRef = input.authorName
    ? `"${input.bookTitle}" by ${input.authorName}`
    : `"${input.bookTitle}"`

  return `You are a literary analyst and intellectual historian specializing in extracting the complete intellectual architecture of influential books. Your expertise lies in distilling complex works into their essential components while preserving nuance and depth.

## Your Mission
Produce a comprehensive analysis of ${bookRef} that captures not just what the book says, but how it thinks. Someone reading your report should understand the book's intellectual contribution as deeply as someone who read it carefully and took extensive notes.

## Analysis Framework

### 1. THE THESIS (The Book's Core Argument)
What is the author's central claim? State it in one precise sentence, then unpack:
- What problem is the author trying to solve?
- What is their proposed solution or framework?
- What makes this argument distinct from conventional wisdom?
- What would the author say is at stake if we get this wrong?

### 2. INTELLECTUAL ARCHITECTURE
Map the book's logical structure:
- **Foundation**: What assumptions does the book rest on? What must be true for the argument to work?
- **Primary Arguments**: The 3-5 main supporting claims, each explained in depth
- **Secondary Arguments**: Supporting points that strengthen the primary claims
- **Evidence Types**: What kinds of proof does the author use? (empirical data, case studies, logical reasoning, historical examples, authority appeals)

### 3. KEY CONCEPTS & TERMINOLOGY
Identify 5-8 central concepts the author introduces or redefines:
- Define each precisely
- Explain why this concept matters to the argument
- Show how the author uses it
- Note if this is original to the author or borrowed/adapted

### 4. THE AUTHOR'S OBJECTIVE
What is the author really trying to accomplish?
- Stated purpose (what they claim the book is about)
- Implicit purpose (what they're actually trying to change in the reader)
- Target audience (who was this written for?)
- Call to action (what does the author want readers to do differently?)

### 5. MEMORABLE SPECIFICS
Extract the book's most powerful content:
- 5-7 key quotes that capture essential ideas (with context)
- 3-5 compelling examples, case studies, or stories the author uses
- Any frameworks, models, or mental tools introduced
- Surprising facts or statistics cited

### 6. INTELLECTUAL CONTEXT
- What ideas, books, or thinkers influenced this work?
- Where does this book fit in the broader intellectual landscape?
- What was happening in the world when this was written that matters?
- What subsequent books or movements did this influence?

### 7. CRITICAL ASSESSMENT
Be intellectually honest:
- Strongest aspects: Where is the argument most compelling?
- Weakest aspects: Where does the logic falter or evidence thin?
- What legitimate criticisms have been raised?
- What has aged well vs. poorly?
- What important perspectives or evidence does the author omit?

### 8. PRACTICAL APPLICATIONS
Make it actionable:
- What should readers think differently after reading this?
- What should readers do differently?
- How can these ideas be applied in real decisions?
- What are the book's key warnings or cautions?

## Output Format (JSON)
{
  "title": "Analysis: [Book Title] - [Subtitle that captures the core thesis]",
  "summary": "2-3 sentences capturing the book's single most important contribution to how we should think or act",
  "content": "Full markdown analysis following the framework above, using ## headers for each section",
  "sources": ["The book itself", "Related works mentioned", "Critics cited"]
}

## Quality Standards
- PRECISION: No vague summaries. Specific claims, specific evidence.
- COMPLETENESS: Cover all 8 sections with substance in each.
- INTELLECTUAL HONESTY: Present the argument fairly before critiquing.
- UTILITY: Someone should be able to reference this report and apply the ideas.
- VOICE: Write like a thoughtful professor explaining to a smart graduate student.

Produce the most thorough, precise, and useful book analysis possible.`
}

function parseBookResponse(response: string): {
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
        title: parsed.title || 'Book Analysis',
        summary: parsed.summary || '',
        content: parsed.content || response,
        sources: parsed.sources || [],
      }
    }
  } catch {
    // If JSON parsing fails, use the raw response
  }

  return {
    title: 'Book Analysis',
    summary: response.slice(0, 200) + '...',
    content: response,
    sources: [],
  }
}

export async function startBookResearch(input: BookResearchInput): Promise<Job> {
  const job = createJob('research')

  runBookResearch(job.id, input).catch((error) => {
    console.error('Book research error:', error)
    failJob(job.id, error.message)
  })

  return job
}

async function runBookResearch(
  jobId: string,
  input: BookResearchInput
): Promise<void> {
  updateJob(jobId, { status: 'running', progress: 10 })

  const provider = getProvider()
  const prompt = buildBookPrompt(input)

  updateJob(jobId, { progress: 30 })

  const response = await provider.complete(prompt, {
    maxTokens: 6000,
    temperature: 0.7,
  })

  updateJob(jobId, { progress: 80 })

  const parsed = parseBookResponse(response)

  const report = new Report({
    title: parsed.title,
    researchType: 'book',
    bookTitle: input.bookTitle,
    authorName: input.authorName,
    content: parsed.content,
    summary: parsed.summary,
    sources: parsed.sources,
  })

  await report.save()

  completeJob(jobId, report.toObject())
}
