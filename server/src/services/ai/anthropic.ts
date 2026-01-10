import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'
import type { AIProvider, AIOptions } from './provider.js'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: env.anthropicApiKey,
    })
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    return textBlock && textBlock.type === 'text' ? textBlock.text : ''
  }
}
