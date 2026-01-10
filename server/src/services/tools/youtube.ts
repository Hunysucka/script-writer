import { YoutubeTranscript } from 'youtube-transcript'

export interface TranscriptSegment {
  text: string
  offset: number
  duration: number
}

export interface VideoTranscript {
  videoId: string
  transcript: string
  segments: TranscriptSegment[]
}

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(urlOrId: string): string {
  // If it's already just an ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId
  }

  // Try to parse as URL
  try {
    const url = new URL(urlOrId)

    // youtube.com/watch?v=VIDEO_ID
    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v')
      if (videoId) return videoId
    }

    // youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1)
    }

    // youtube.com/embed/VIDEO_ID
    if (url.pathname.includes('/embed/')) {
      return url.pathname.split('/embed/')[1].split('/')[0]
    }
  } catch {
    // Not a valid URL, might be malformed
  }

  throw new Error(`Could not extract video ID from: ${urlOrId}`)
}

/**
 * Fetch transcript from a YouTube video
 */
export async function getYouTubeTranscript(
  urlOrId: string
): Promise<VideoTranscript> {
  const videoId = extractVideoId(urlOrId)

  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)

    const segments: TranscriptSegment[] = transcriptData.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }))

    // Combine all segments into full transcript
    const transcript = segments.map((s) => s.text).join(' ')

    return {
      videoId,
      transcript,
      segments,
    }
  } catch (error) {
    console.error('YouTube transcript error:', error)
    throw new Error(
      `Failed to fetch transcript for ${videoId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Fetch transcripts from multiple videos in parallel
 */
export async function getMultipleTranscripts(
  urlsOrIds: string[]
): Promise<Array<VideoTranscript | { error: string; videoId: string }>> {
  const results = await Promise.allSettled(
    urlsOrIds.map((id) => getYouTubeTranscript(id))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        error: result.reason?.message || 'Failed to fetch transcript',
        videoId: urlsOrIds[index],
      }
    }
  })
}

/**
 * Search YouTube (via web search) and get transcripts from top results
 */
export async function searchYouTubeAndGetTranscripts(
  query: string,
  maxVideos: number = 3
): Promise<{
  searchQuery: string
  transcripts: Array<VideoTranscript | { error: string; videoId: string }>
}> {
  // This would require YouTube Data API or web scraping
  // For now, we'll rely on Tavily to find YouTube URLs
  // and then fetch transcripts from those

  // Placeholder - in production, integrate with YouTube Data API
  return {
    searchQuery: query,
    transcripts: [],
  }
}
