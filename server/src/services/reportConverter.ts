interface BookAnalysis {
  title?: string
  summary?: string
  content?: string
  thesis?: {
    centralClaim?: string
    problem?: string
    solution?: string
    distinctiveness?: string
    stakes?: string
  }
  intellectualArchitecture?: {
    foundation?: string[]
    primaryArguments?: Array<{ claim: string; explanation: string }>
    secondaryArguments?: string[]
    evidenceTypes?: string[]
  }
  keyConcepts?: Array<{
    term: string
    definition: string
    importance?: string
    usage?: string
    origin?: string
  }>
  authorObjective?: {
    statedPurpose?: string
    implicitPurpose?: string
    targetAudience?: string
    callToAction?: string
  }
  memorableSpecifics?: {
    quotes?: Array<{ quote: string; context?: string }>
    examples?: string[]
    frameworks?: string[]
    facts?: string[]
  }
  intellectualContext?: {
    influences?: string[]
    landscape?: string
    historicalContext?: string
    subsequentInfluence?: string[]
  }
  criticalAssessment?: {
    strengths?: string[]
    weaknesses?: string[]
    criticisms?: string[]
    aged?: { well?: string[]; poorly?: string[] }
    omissions?: string[]
  }
  practicalApplications?: {
    thinkDifferently?: string[]
    doDifferently?: string[]
    realDecisions?: string[]
    warnings?: string[]
  }
  sources?: string[]
}

function formatSection(title: string, content: string | string[] | undefined): string {
  if (!content) return ''
  if (Array.isArray(content)) {
    if (content.length === 0) return ''
    return `## ${title}\n\n${content.map(item => `- ${item}`).join('\n')}\n\n`
  }
  return `## ${title}\n\n${content}\n\n`
}

function formatQuotes(quotes: Array<{ quote: string; context?: string }> | undefined): string {
  if (!quotes || quotes.length === 0) return ''
  return quotes.map(q => `> "${q.quote}"${q.context ? `\n> — ${q.context}` : ''}`).join('\n\n')
}

function formatConcepts(concepts: BookAnalysis['keyConcepts']): string {
  if (!concepts || concepts.length === 0) return ''
  return concepts.map(c => 
    `### ${c.term}\n\n${c.definition}${c.importance ? `\n\n**Why it matters:** ${c.importance}` : ''}`
  ).join('\n\n')
}

function formatArguments(args: BookAnalysis['intellectualArchitecture']): string {
  if (!args) return ''
  let result = ''
  
  if (args.foundation && args.foundation.length > 0) {
    result += `### Foundation\n\n${args.foundation.map(f => `- ${f}`).join('\n')}\n\n`
  }
  
  if (args.primaryArguments && args.primaryArguments.length > 0) {
    result += `### Primary Arguments\n\n${args.primaryArguments.map(a => 
      `**${a.claim}**\n\n${a.explanation}`
    ).join('\n\n')}\n\n`
  }
  
  if (args.secondaryArguments && args.secondaryArguments.length > 0) {
    result += `### Supporting Points\n\n${args.secondaryArguments.map(a => `- ${a}`).join('\n')}\n\n`
  }
  
  if (args.evidenceTypes && args.evidenceTypes.length > 0) {
    result += `### Types of Evidence Used\n\n${args.evidenceTypes.map(e => `- ${e}`).join('\n')}\n\n`
  }
  
  return result
}

export function convertStructuredToMarkdown(structured: Record<string, unknown>): string {
  const data = structured as BookAnalysis
  let markdown = ''

  if (data.content && typeof data.content === 'string' && !data.content.startsWith('{')) {
    return data.content
  }

  if (data.thesis) {
    markdown += `## The Thesis\n\n`
    if (data.thesis.centralClaim) markdown += `**Central Claim:** ${data.thesis.centralClaim}\n\n`
    if (data.thesis.problem) markdown += `**Problem:** ${data.thesis.problem}\n\n`
    if (data.thesis.solution) markdown += `**Solution:** ${data.thesis.solution}\n\n`
    if (data.thesis.distinctiveness) markdown += `**What Makes It Distinct:** ${data.thesis.distinctiveness}\n\n`
    if (data.thesis.stakes) markdown += `**What's At Stake:** ${data.thesis.stakes}\n\n`
  }

  if (data.intellectualArchitecture) {
    markdown += `## Intellectual Architecture\n\n`
    markdown += formatArguments(data.intellectualArchitecture)
  }

  if (data.keyConcepts && data.keyConcepts.length > 0) {
    markdown += `## Key Concepts\n\n`
    markdown += formatConcepts(data.keyConcepts)
    markdown += '\n\n'
  }

  if (data.authorObjective) {
    markdown += `## The Author's Objective\n\n`
    if (data.authorObjective.statedPurpose) markdown += `**Stated Purpose:** ${data.authorObjective.statedPurpose}\n\n`
    if (data.authorObjective.implicitPurpose) markdown += `**Implicit Purpose:** ${data.authorObjective.implicitPurpose}\n\n`
    if (data.authorObjective.targetAudience) markdown += `**Target Audience:** ${data.authorObjective.targetAudience}\n\n`
    if (data.authorObjective.callToAction) markdown += `**Call to Action:** ${data.authorObjective.callToAction}\n\n`
  }

  if (data.memorableSpecifics) {
    markdown += `## Memorable Specifics\n\n`
    if (data.memorableSpecifics.quotes && data.memorableSpecifics.quotes.length > 0) {
      markdown += `### Key Quotes\n\n${formatQuotes(data.memorableSpecifics.quotes)}\n\n`
    }
    if (data.memorableSpecifics.examples && data.memorableSpecifics.examples.length > 0) {
      markdown += `### Examples & Case Studies\n\n${data.memorableSpecifics.examples.map(e => `- ${e}`).join('\n')}\n\n`
    }
    if (data.memorableSpecifics.frameworks && data.memorableSpecifics.frameworks.length > 0) {
      markdown += `### Frameworks & Mental Models\n\n${data.memorableSpecifics.frameworks.map(f => `- ${f}`).join('\n')}\n\n`
    }
  }

  if (data.intellectualContext) {
    markdown += `## Intellectual Context\n\n`
    if (data.intellectualContext.influences && data.intellectualContext.influences.length > 0) {
      markdown += `**Influences:** ${data.intellectualContext.influences.join(', ')}\n\n`
    }
    if (data.intellectualContext.landscape) markdown += `${data.intellectualContext.landscape}\n\n`
    if (data.intellectualContext.historicalContext) markdown += `**Historical Context:** ${data.intellectualContext.historicalContext}\n\n`
  }

  if (data.criticalAssessment) {
    markdown += `## Critical Assessment\n\n`
    if (data.criticalAssessment.strengths && data.criticalAssessment.strengths.length > 0) {
      markdown += `### Strengths\n\n${data.criticalAssessment.strengths.map(s => `- ${s}`).join('\n')}\n\n`
    }
    if (data.criticalAssessment.weaknesses && data.criticalAssessment.weaknesses.length > 0) {
      markdown += `### Weaknesses\n\n${data.criticalAssessment.weaknesses.map(w => `- ${w}`).join('\n')}\n\n`
    }
    if (data.criticalAssessment.criticisms && data.criticalAssessment.criticisms.length > 0) {
      markdown += `### Criticisms\n\n${data.criticalAssessment.criticisms.map(c => `- ${c}`).join('\n')}\n\n`
    }
  }

  if (data.practicalApplications) {
    markdown += `## Practical Applications\n\n`
    if (data.practicalApplications.thinkDifferently && data.practicalApplications.thinkDifferently.length > 0) {
      markdown += `### Think Differently\n\n${data.practicalApplications.thinkDifferently.map(t => `- ${t}`).join('\n')}\n\n`
    }
    if (data.practicalApplications.doDifferently && data.practicalApplications.doDifferently.length > 0) {
      markdown += `### Do Differently\n\n${data.practicalApplications.doDifferently.map(d => `- ${d}`).join('\n')}\n\n`
    }
    if (data.practicalApplications.warnings && data.practicalApplications.warnings.length > 0) {
      markdown += `### Warnings & Cautions\n\n${data.practicalApplications.warnings.map(w => `- ${w}`).join('\n')}\n\n`
    }
  }

  if (markdown.trim() === '') {
    return prettyPrintJson(structured)
  }

  return markdown.trim()
}

function prettyPrintJson(obj: Record<string, unknown>, indent = 0): string {
  const lines: string[] = []
  const prefix = '  '.repeat(indent)
  
  for (const [key, value] of Object.entries(obj)) {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    
    if (value === null || value === undefined) continue
    
    if (typeof value === 'string') {
      lines.push(`${prefix}**${formattedKey}:** ${value}`)
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${prefix}**${formattedKey}:**`)
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`${prefix}- ${item}`)
        } else if (typeof item === 'object') {
          lines.push(`${prefix}- ${JSON.stringify(item)}`)
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${prefix}## ${formattedKey}`)
      lines.push(prettyPrintJson(value as Record<string, unknown>, indent + 1))
    }
  }
  
  return lines.join('\n\n')
}

export function isJsonContent(content: string): boolean {
  const trimmed = content.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('```json')) return false
  
  try {
    const jsonStr = trimmed.startsWith('```json') 
      ? trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      : trimmed
    JSON.parse(jsonStr)
    return true
  } catch {
    return false
  }
}

export function parseJsonContent(content: string): Record<string, unknown> | null {
  try {
    const trimmed = content.trim()
    const jsonStr = trimmed.startsWith('```json')
      ? trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      : trimmed
    
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
  } catch {
    return null
  }
  return null
}
