export type AgentStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed'
export type ScriptPlatform = 'youtube' | 'instagram' | 'both'
export type ResearchType = 'book' | 'author' | 'topic'

export interface ResearchInput {
  type: ResearchType
  bookTitle?: string
  authorName?: string
  topic?: string
  focusTopics?: string[]
}

export interface ResearchReport {
  id: string
  title: string
  researchType: ResearchType
  bookTitle?: string
  authorName?: string
  topic?: string
  content: string // Markdown content
  summary: string
  sources: string[]
  status: AgentStatus
  createdAt: string
  updatedAt: string
}

export interface Script {
  id: string
  title: string
  content: string
  platform: ScriptPlatform
  reportIds: string[]
  prompt: string
  status: 'draft' | 'final'
  createdAt: string
  updatedAt: string
}

export interface AgentJob {
  id: string
  type: 'research' | 'script'
  status: AgentStatus
  progress: number
  result?: ResearchReport | Script
  error?: string
  startedAt: string
  completedAt?: string
}

export interface AppState {
  reports: ResearchReport[]
  scripts: Script[]
  activeJob: AgentJob | null
  isLoading: boolean
  error: string | null
}

export type AppAction =
  | { type: 'SET_REPORTS'; payload: ResearchReport[] }
  | { type: 'ADD_REPORT'; payload: ResearchReport }
  | { type: 'UPDATE_REPORT'; payload: ResearchReport }
  | { type: 'DELETE_REPORT'; payload: string }
  | { type: 'SET_SCRIPTS'; payload: Script[] }
  | { type: 'ADD_SCRIPT'; payload: Script }
  | { type: 'UPDATE_SCRIPT'; payload: Script }
  | { type: 'DELETE_SCRIPT'; payload: string }
  | { type: 'SET_ACTIVE_JOB'; payload: AgentJob | null }
  | { type: 'UPDATE_JOB_PROGRESS'; payload: { progress: number; status?: AgentStatus } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
