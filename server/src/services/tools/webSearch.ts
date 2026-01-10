import { tavily } from '@tavily/core'
import { env } from '../../config/env.js'

const client = tavily({ apiKey: env.tavilyApiKey })

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  answer?: string
}

/**
 * Perform a web search using Tavily API
 * @param query - The search query
 * @param options - Search options
 */
export async function webSearch(
  query: string,
  options: {
    maxResults?: number
    searchDepth?: 'basic' | 'advanced'
    includeAnswer?: boolean
    includeDomains?: string[]
    excludeDomains?: string[]
  } = {}
): Promise<SearchResponse> {
  const {
    maxResults = 10,
    searchDepth = 'advanced',
    includeAnswer = true,
    includeDomains,
    excludeDomains,
  } = options

  try {
    const response = await client.search(query, {
      maxResults,
      searchDepth,
      includeAnswer,
      includeDomains,
      excludeDomains,
    })

    return {
      query,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: response.answer,
    }
  } catch (error) {
    console.error('Web search error:', error)
    throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Perform multiple searches in parallel
 */
export async function multiSearch(
  queries: string[],
  options: Parameters<typeof webSearch>[1] = {}
): Promise<SearchResponse[]> {
  return Promise.all(queries.map((q) => webSearch(q, options)))
}

/**
 * Search for authoritative sources on a topic
 */
export async function searchAuthoritativeSources(
  topic: string,
  options: {
    domains?: string[]
    maxResults?: number
  } = {}
): Promise<SearchResponse> {
  const authoritativeDomains = options.domains || [
    'wikipedia.org',
    'britannica.com',
    'investopedia.com',
    'economist.com',
    'ft.com',
    'wsj.com',
    'hbr.org',
    'nber.org',
    'jstor.org',
    'scholar.google.com',
  ]

  return webSearch(topic, {
    maxResults: options.maxResults || 10,
    searchDepth: 'advanced',
    includeAnswer: true,
    includeDomains: authoritativeDomains,
  })
}
