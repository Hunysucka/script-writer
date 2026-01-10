import OpenAI from 'openai'
import { env } from '../../config/env.js'
import type { AIProvider, AIOptions } from './provider.js'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: env.openaiApiKey,
    })
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
    })

    return response.choices[0]?.message?.content || ''
  }
}
