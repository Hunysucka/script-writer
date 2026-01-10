import { env } from '../../config/env.js'
import { OpenAIProvider } from './openai.js'
import { AnthropicProvider } from './anthropic.js'

export interface AIOptions {
  maxTokens?: number
  temperature?: number
}

export interface AIProvider {
  complete(prompt: string, options?: AIOptions): Promise<string>
}

export function getProvider(name?: 'openai' | 'anthropic'): AIProvider {
  const providerName = name || env.aiProvider

  if (providerName === 'anthropic') {
    return new AnthropicProvider()
  }

  return new OpenAIProvider()
}
