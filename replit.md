# ScriptWriter

## Overview

ScriptWriter is an AI-powered application for creating video scripts for YouTube and Instagram Shorts. The app follows a research-first workflow: users conduct deep research on books, authors, or topics using AI agents, then use those research reports as context to generate polished video scripts. The application is designed for content creators who want to produce educational, intellectually substantive short-form content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript, built using Vite 7
- **Routing**: React Router DOM v7 with lazy-loaded pages for code splitting
- **State Management**: React Context + useReducer pattern (AppContext) for global state
- **Styling**: Tailwind CSS v4 with custom theme (serif typography, warm accent colors)
- **UI Approach**: Component-based with reusable UI primitives (Button, Card, Input, MarkdownEditor)
- **Features**: 
  - PWA-ready with manifest and icons
  - Dark mode support with system preference detection
  - Mobile-first responsive design with bottom navigation
  - Error boundaries for graceful error handling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Pattern**: RESTful API with job-based async processing
- **Job System**: In-memory job manager for tracking long-running AI operations (research, script generation)
- **AI Integration**: Provider abstraction layer supporting both OpenAI (GPT-4o) and Anthropic (Claude Sonnet)
- **Research Agents**: Specialized agents for different research types:
  - Book Agent: Analyzes books using AI knowledge
  - Author Agent: Researches authors using web search and YouTube transcripts
  - Topic Agent: Comprehensive topic research with authoritative sources

### API Structure
- `/api/agents` - Start research or script generation jobs, check job status
- `/api/reports` - CRUD operations for research reports
- `/api/scripts` - CRUD operations for generated scripts
- `/api/health` - Health check endpoint

### Data Flow
1. User initiates research (book/author/topic) → Creates async job
2. Frontend polls job status until completion
3. Completed research saved as Report in MongoDB
4. User selects reports + provides prompt → Script generation job
5. Generated script saved and returned to user

## External Dependencies

### Database
- **MongoDB**: Primary data store via Mongoose ODM
- **Models**: Report (research documents) and Script (generated scripts)

### AI Services
- **Anthropic Claude API**: Primary AI provider for research and script generation
- **OpenAI API**: Alternative AI provider (configurable via AI_PROVIDER env var)

### Research Tools
- **Tavily API**: Web search for gathering research on authors and topics
- **youtube-transcript**: Extracts transcripts from YouTube videos for author research

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `ANTHROPIC_API_KEY` - Anthropic API key
- `OPENAI_API_KEY` - OpenAI API key (if using OpenAI provider)
- `TAVILY_API_KEY` - Tavily search API key
- `AI_PROVIDER` - Either "anthropic" or "openai" (defaults to anthropic)
- `PORT` - Server port (defaults to 3001)

### Development Setup
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 3001
- Vite proxies `/api` requests to backend