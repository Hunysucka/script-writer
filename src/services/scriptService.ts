import { apiRequest } from './api'
import type { Script, ScriptPlatform } from '@/types'

interface GenerateScriptParams {
  reportIds: string[]
  prompt: string
  platform: ScriptPlatform
}

// Transform MongoDB document to frontend format
function transformScript(doc: Record<string, unknown>): Script {
  return {
    id: (doc._id as string) || (doc.id as string),
    title: doc.title as string,
    content: doc.content as string,
    platform: doc.platform as ScriptPlatform,
    reportIds: doc.reportIds as string[],
    prompt: doc.prompt as string,
    status: doc.status as 'draft' | 'final',
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  }
}

export const scriptService = {
  async generateScript(params: GenerateScriptParams): Promise<Script> {
    // Start the script generation job
    const response = await apiRequest<{ jobId: string }>('/agents/script', {
      method: 'POST',
      body: JSON.stringify(params),
    })

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const status = await apiRequest<{
        status: string
        result?: Record<string, unknown>
        error?: string
      }>(`/agents/${response.jobId}/status`)

      if (status.status === 'completed' && status.result) {
        return transformScript(status.result)
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Script generation failed')
      }

      attempts++
    }

    throw new Error('Script generation timed out')
  },

  async getScripts(search?: string): Promise<Script[]> {
    const endpoint = search ? `/scripts?search=${encodeURIComponent(search)}` : '/scripts'
    const docs = await apiRequest<Record<string, unknown>[]>(endpoint)
    return docs.map(transformScript)
  },

  async getScript(id: string): Promise<Script | null> {
    try {
      const doc = await apiRequest<Record<string, unknown>>(`/scripts/${id}`)
      return transformScript(doc)
    } catch {
      return null
    }
  },

  async updateScript(script: Script): Promise<Script> {
    const doc = await apiRequest<Record<string, unknown>>(`/scripts/${script.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: script.title,
        content: script.content,
        status: script.status,
      }),
    })
    return transformScript(doc)
  },

  async deleteScript(id: string): Promise<void> {
    await apiRequest(`/scripts/${id}`, { method: 'DELETE' })
  },
}
