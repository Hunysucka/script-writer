import { delay, generateId } from './api'
import type { AgentJob, ResearchReport, ResearchInput } from '@/types'

// Mock job storage
const jobs = new Map<string, AgentJob>()

// Generate markdown report based on research type
function generateMockReport(input: ResearchInput): ResearchReport {
  const now = new Date().toISOString()
  let title: string
  let content: string
  let summary: string
  let sources: string[]

  if (input.type === 'book') {
    const book = input.bookTitle || 'Unknown Book'
    const author = input.authorName ? ` by ${input.authorName}` : ''
    title = `Book Analysis: ${book}${author}`
    summary = `A comprehensive analysis of "${book}"${author}, exploring its key themes, arguments, and relevance to economics and personal finance.`
    sources = [
      `${book} - Original Text`,
      'Amazon Reviews & Reader Discussions',
      'Academic Citations & References',
      'Author Interviews & Lectures',
    ]
    content = `# ${book}${author}

## Overview

"${book}" is a significant work that explores fundamental concepts relevant to economics, markets, and personal finance. This report provides a detailed analysis for content creation purposes.

## Key Themes

### 1. Core Arguments
The book presents several foundational ideas:
- **Primary thesis**: The central argument revolves around...
- **Supporting evidence**: The author draws from historical examples and data...
- **Practical implications**: Readers can apply these concepts to...

### 2. Historical Context
Understanding when and why this book was written:
- Publication context and reception
- Influence on subsequent economic thought
- Relevance to modern financial discourse

### 3. Target Audience
Who benefits most from this material:
- Individual investors seeking deeper understanding
- Students of economics and finance
- Content creators in the financial education space

## Notable Quotes

> "The most important quote from the book that encapsulates its main message..."

> "Another significant passage that resonates with modern readers..."

## Chapter-by-Chapter Summary

### Introduction
Sets the stage for the book's central arguments...

### Part I: Foundations
Establishes the theoretical framework...

### Part II: Applications
Demonstrates practical applications...

### Conclusion
Synthesizes the key takeaways...

## Strengths & Weaknesses

### Strengths
- Accessible writing style
- Well-researched arguments
- Timeless principles

### Weaknesses
- Some dated examples
- Could benefit from more modern case studies

## Content Opportunities

### Video Script Ideas
1. "What ${book} Teaches Us About [Topic]"
2. "3 Lessons from ${book} for Modern Investors"
3. "Why ${book} Is Still Relevant in ${new Date().getFullYear()}"

### Key Talking Points
- The counterintuitive insight about...
- Why mainstream thinking gets this wrong...
- How to apply this to your own finances...

## Further Research

- Related books in this genre
- Author's other works
- Contemporary critiques and discussions
`
  } else if (input.type === 'author') {
    const author = input.authorName || 'Unknown Author'
    title = `Author Profile: ${author}`
    summary = `An in-depth profile of ${author}, examining their body of work, philosophical foundations, and influence on economic thought.`
    sources = [
      `${author} - Collected Works`,
      'Biographical Sources',
      'Academic Papers & Citations',
      'Interviews & Lectures',
    ]
    content = `# ${author}

## Biography

### Early Life & Education
${author}'s formative years and educational background shaped their unique perspective on economics and markets...

### Career & Contributions
A timeline of major works and achievements:
- **Major publications**: List of influential books and papers
- **Academic positions**: Universities and institutions
- **Public influence**: Media appearances, consulting roles

## Philosophical Framework

### Core Beliefs
The foundational principles that guide ${author}'s thinking:
1. **First principle**: Explanation and implications...
2. **Second principle**: How this differs from mainstream thought...
3. **Third principle**: Practical applications...

### Intellectual Influences
Who shaped ${author}'s thinking:
- Historical economists and philosophers
- Contemporary thinkers and collaborators
- Real-world events and observations

## Major Works

### Book 1: [Title]
- **Year**: Publication date
- **Key thesis**: Main argument
- **Impact**: How it influenced the field

### Book 2: [Title]
- **Year**: Publication date
- **Key thesis**: Main argument
- **Impact**: How it influenced the field

## Notable Quotes

> "A defining quote that captures ${author}'s worldview..."

> "Another memorable insight..."

## Criticism & Controversy

### Common Critiques
- Areas where critics disagree
- Responses to mainstream economics
- Ongoing debates

### ${author}'s Responses
How they've addressed criticism over the years...

## Legacy & Relevance

### Influence on Modern Thought
How ${author}'s ideas continue to shape:
- Academic economics
- Investment philosophy
- Public policy debates

### Content Opportunities
1. "${author}'s Most Controversial Ideas"
2. "What ${author} Got Right (and Wrong)"
3. "Applying ${author}'s Framework to Modern Markets"

## Recommended Reading Order

For those new to ${author}:
1. Start with: [Accessible introduction]
2. Then read: [Core work]
3. Advanced: [Technical/comprehensive work]
`
  } else {
    // Topic/concept research
    const topic = input.topic || 'Unknown Topic'
    title = `Research Report: ${topic}`
    summary = `A thorough exploration of ${topic}, covering foundational concepts, key thinkers, practical applications, and content creation opportunities.`
    sources = [
      'Academic Textbooks & Papers',
      'Historical Primary Sources',
      'Contemporary Analysis & Commentary',
      'Educational Resources & Courses',
    ]
    content = `# ${topic}

## Executive Summary

${topic} is a significant concept in economics and finance that has profound implications for investors, policymakers, and individuals seeking financial literacy. This report provides a comprehensive overview suitable for educational content creation.

## What is ${topic}?

### Definition
A clear, accessible explanation of the concept...

### Origins
Where and when this idea emerged:
- Historical context
- Key founding figures
- Evolution over time

### Core Principles

#### Principle 1: [Name]
Detailed explanation with examples...

#### Principle 2: [Name]
Detailed explanation with examples...

#### Principle 3: [Name]
Detailed explanation with examples...

## Key Thinkers & Contributors

### Historical Figures
- **[Name]**: Contribution and significance
- **[Name]**: Contribution and significance

### Modern Proponents
- **[Name]**: Contemporary applications
- **[Name]**: Current research and writing

## Practical Applications

### For Individual Investors
How understanding ${topic} can improve:
- Investment decision-making
- Risk assessment
- Long-term planning

### For Personal Finance
Applications to everyday financial decisions:
- Budgeting and saving
- Debt management
- Career and income decisions

## Common Misconceptions

### Myth 1
The misconception and the reality...

### Myth 2
The misconception and the reality...

## ${topic} vs. Mainstream Views

| Aspect | ${topic} View | Mainstream View |
|--------|---------------|-----------------|
| [Aspect 1] | Position | Position |
| [Aspect 2] | Position | Position |
| [Aspect 3] | Position | Position |

## Real-World Examples

### Historical Case Study
A concrete example demonstrating these principles...

### Modern Application
How this plays out in today's markets...

## Content Opportunities

### Video Ideas
1. "${topic} Explained in 60 Seconds"
2. "Why ${topic} Matters for Your Portfolio"
3. "The Controversial Truth About ${topic}"

### Key Talking Points
- The surprising insight that hooks viewers...
- Common mistakes to avoid...
- Actionable takeaways...

## Further Learning

### Books
- [Title] by [Author]
- [Title] by [Author]

### Online Resources
- Courses and lectures
- Podcasts and channels
- Communities and forums

## Glossary of Terms

- **Term 1**: Definition
- **Term 2**: Definition
- **Term 3**: Definition
`
  }

  return {
    id: generateId(),
    title,
    researchType: input.type,
    bookTitle: input.bookTitle,
    authorName: input.authorName,
    topic: input.topic,
    content,
    summary,
    sources,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  }
}

export const agentService = {
  async startResearch(input: ResearchInput): Promise<AgentJob> {
    await delay(300)

    const job: AgentJob = {
      id: generateId(),
      type: 'research',
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    }

    jobs.set(job.id, job)

    // Simulate progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        const report = generateMockReport(input)
        jobs.set(job.id, {
          ...job,
          status: 'completed',
          progress: 100,
          result: report,
          completedAt: new Date().toISOString(),
        })
      } else {
        jobs.set(job.id, { ...job, progress: Math.floor(progress) })
      }
    }, 600)

    return job
  },

  async getJobStatus(jobId: string): Promise<AgentJob> {
    await delay(100)
    const job = jobs.get(jobId)
    if (!job) {
      throw new Error('Job not found')
    }
    return job
  },
}
