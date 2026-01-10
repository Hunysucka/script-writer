import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const env = {
  port: parseInt(process.env.PORT || (isProduction ? '5000' : '3001'), 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/scriptwriter',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  aiProvider: (process.env.AI_PROVIDER || 'anthropic') as 'openai' | 'anthropic',
}
