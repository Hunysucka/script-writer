import { delay, generateId } from './api'
import type { Script, ScriptPlatform } from '@/types'

// In-memory mock storage
let scripts: Script[] = []

interface GenerateScriptParams {
  reportIds: string[]
  prompt: string
  platform: ScriptPlatform
}

// Generate mock script content
function generateMockScriptContent(
  platform: ScriptPlatform,
  prompt: string
): string {
  const platformNote =
    platform === 'youtube'
      ? '(YouTube Short - 60 sec max)'
      : platform === 'instagram'
        ? '(Instagram Reel - 90 sec max)'
        : '(Multi-platform - 60 sec)'

  return `SCRIPT ${platformNote}

[HOOK - 0:00-0:03]
"Did you know this about ${prompt.slice(0, 30)}...?"

[INTRO - 0:03-0:10]
Quick introduction to the topic.
Keep it punchy and engaging.

[MAIN CONTENT - 0:10-0:45]
Point 1: Key insight from research
- Visual: Show relevant b-roll
- Text overlay: Highlight stat

Point 2: Surprising fact
- Transition: Quick cut
- Audio: Sound effect

Point 3: Actionable takeaway
- CTA setup

[OUTRO - 0:45-0:60]
"Follow for more content like this!"
Point to follow button
End with call-to-action

---
Notes: ${prompt}`
}

export const scriptService = {
  async generateScript(params: GenerateScriptParams): Promise<Script> {
    await delay(2000) // Simulate AI generation time

    const script: Script = {
      id: generateId(),
      title: `Script: ${params.prompt.slice(0, 40)}...`,
      content: generateMockScriptContent(params.platform, params.prompt),
      platform: params.platform,
      reportIds: params.reportIds,
      prompt: params.prompt,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    scripts = [script, ...scripts]
    return script
  },

  async getScripts(search?: string): Promise<Script[]> {
    await delay(200)
    if (!search) return scripts

    const query = search.toLowerCase()
    return scripts.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query)
    )
  },

  async getScript(id: string): Promise<Script | null> {
    await delay(100)
    return scripts.find((s) => s.id === id) || null
  },

  async updateScript(script: Script): Promise<Script> {
    await delay(200)
    const updated = { ...script, updatedAt: new Date().toISOString() }
    scripts = scripts.map((s) => (s.id === script.id ? updated : s))
    return updated
  },

  async deleteScript(id: string): Promise<void> {
    await delay(100)
    scripts = scripts.filter((s) => s.id !== id)
  },
}
