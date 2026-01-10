# PRD: ScriptWriter - AI-Powered Short-Form Video Script Generator

## 1. Introduction/Overview

**Problem Statement:** Content creators producing short-form videos (YouTube Shorts, Instagram Reels) spend excessive time researching topics, synthesizing information, and crafting scripts that balance depth with brevity. Existing tools either generate shallow, generic content or require significant manual curation.

**Solution:** ScriptWriter is a mobile-first PWA that uses specialized AI research agents to deeply analyze books, authors, and topics, then generates polished scripts with a calm, authoritative voice suitable for educational short-form content.

**Target Users:**
- Content creators focused on finance, investing, economics, and personal development
- Educators creating short-form educational content
- Individuals building thought-leadership through video

---

## 2. Goals

- **G-1:** Enable users to generate research-backed scripts in under 5 minutes (vs. hours of manual research)
- **G-2:** Produce scripts with consistent voice: calm authority, deep substance, no hype or clickbait
- **G-3:** Deliver a mobile-first experience that works seamlessly on phones and tablets
- **G-4:** Build a catalog system where research reports can be combined and reused across multiple scripts
- **G-5:** Support offline access to saved reports and scripts (PWA)

---

## 3. User Stories

### Research Flow

**US-001: Book Research**
> As a content creator, I want to research a book by entering its title so that I can extract the thesis, key arguments, and memorable quotes without reading the entire book.

Acceptance Criteria:
- [ ] User can enter book title and optional author name
- [ ] System displays progress indicator during research (0-100%)
- [ ] Research completes within 60 seconds
- [ ] Report includes: thesis, key concepts (5-8), memorable quotes (5-7), critical assessment
- [ ] Report is saved to catalog automatically
- [ ] Verify in mobile browser: form is usable with thumb, progress visible without scrolling

**US-002: Author Research**
> As a content creator, I want to research an author so that I can understand their worldview, key ideas, and speaking style from interviews and talks.

Acceptance Criteria:
- [ ] User can enter author name and optional focus topics
- [ ] System performs web searches across multiple queries
- [ ] System fetches YouTube transcripts when available
- [ ] Report includes: intellectual framework, direct quotes (8-12), key concepts, entry points
- [ ] Sources are listed with URLs
- [ ] Verify in mobile browser: long reports scroll smoothly, quotes are visually distinct

**US-003: Topic Research**
> As a content creator, I want to research a topic so that I can understand it from first principles with authoritative sources.

Acceptance Criteria:
- [ ] User can enter any topic
- [ ] System searches authoritative domains (Wikipedia, HBR, Investopedia, academic sites)
- [ ] Report includes: definition, mechanism, history, key figures, debates, practical applications
- [ ] Sources are listed with URLs
- [ ] Verify in mobile browser: content is readable without horizontal scrolling

**US-004: Research Progress Tracking**
> As a user, I want to see real-time progress of my research job so that I know the system is working.

Acceptance Criteria:
- [ ] Progress bar updates at minimum 4 stages (10%, 30%, 50%, 80%, 100%)
- [ ] Current stage description shown (e.g., "Searching web...", "Analyzing sources...")
- [ ] User can navigate away and return to see progress
- [ ] On completion, user is notified and can view report
- [ ] Verify in mobile browser: progress indicator visible in viewport

### Script Generation Flow

**US-005: Generate Script from Reports**
> As a content creator, I want to select one or more research reports and generate a script so that I can create content based on my research.

Acceptance Criteria:
- [ ] User can select 1-5 reports from catalog
- [ ] User enters a prompt describing the script angle/focus
- [ ] User selects platform (YouTube, Instagram, Both)
- [ ] Generated script includes: hook, context, core insight, implication, close
- [ ] Script is 140-160 words (speakable in under 60 seconds)
- [ ] Script includes [VISUAL/ACTION NOTES] in brackets
- [ ] Verify in mobile browser: report selection works with touch, checkboxes are tap-friendly

**US-006: Edit Generated Script**
> As a content creator, I want to edit my generated script so that I can refine it before recording.

Acceptance Criteria:
- [ ] Script content is editable in a text area
- [ ] Title is editable
- [ ] Changes auto-save after 2 seconds of inactivity
- [ ] Word count displayed and updates in real-time
- [ ] User can mark script as "final" vs "draft"
- [ ] Verify in mobile browser: keyboard doesn't obscure editing area, text is legible

**US-007: Copy Script to Clipboard**
> As a content creator, I want to copy my script to clipboard so that I can paste it into my teleprompter app.

Acceptance Criteria:
- [ ] Single tap/click copies full script content
- [ ] Visual confirmation shown (toast/feedback)
- [ ] Works on mobile browsers
- [ ] Verify in mobile browser: copy button is easily tappable, confirmation visible

### Catalog Management

**US-008: View Reports Catalog**
> As a user, I want to view all my research reports so that I can find and reuse them.

Acceptance Criteria:
- [ ] Reports displayed as cards with title, type badge, date, summary preview
- [ ] Cards sorted by most recent first
- [ ] Search/filter by title or content
- [ ] Tap card to view full report
- [ ] Verify in mobile browser: cards stack vertically, touch scroll works

**US-009: View Scripts Catalog**
> As a user, I want to view all my scripts so that I can find and edit them.

Acceptance Criteria:
- [ ] Scripts displayed as cards with title, platform badge, status badge, date
- [ ] Cards sorted by most recent first
- [ ] Search/filter by title
- [ ] Tap card to view/edit script
- [ ] Verify in mobile browser: cards stack vertically, badges readable

**US-010: Delete Items**
> As a user, I want to delete reports or scripts I no longer need.

Acceptance Criteria:
- [ ] Delete option available on each item (swipe or menu)
- [ ] Confirmation dialog before deletion
- [ ] Item removed from list immediately after confirmation
- [ ] Verify in mobile browser: delete action accessible without accidental triggers

### Navigation & Layout

**US-011: Bottom Tab Navigation**
> As a mobile user, I want bottom tab navigation so that I can switch between sections with my thumb.

Acceptance Criteria:
- [ ] Three tabs: Research, Write, Catalog
- [ ] Active tab visually highlighted
- [ ] Tabs fixed to bottom of viewport
- [ ] Hidden on desktop (side nav instead)
- [ ] Verify in mobile browser: tabs reachable with one-handed use

**US-012: Responsive Layout**
> As a user, I want the app to work on any screen size.

Acceptance Criteria:
- [ ] Mobile (<768px): single column, bottom nav, full-width cards
- [ ] Tablet (768-1024px): two-column where appropriate
- [ ] Desktop (>1024px): sidebar nav, multi-column layouts
- [ ] No horizontal scrolling on any viewport
- [ ] Verify on iPhone SE, iPhone 14, iPad, Desktop

---

## 4. Functional Requirements

### Backend API

| ID | Requirement |
|----|-------------|
| FR-1 | POST `/api/agents/research` accepts `{type, bookTitle?, authorName?, topic?, focusTopics?}` and returns `{jobId, status}` |
| FR-2 | GET `/api/agents/:jobId/status` returns `{id, type, status, progress, result?, error?}` |
| FR-3 | Book research agent completes without external API calls (uses Claude knowledge) |
| FR-4 | Author research agent performs 6+ parallel web searches via Tavily API |
| FR-5 | Author research agent fetches YouTube transcripts when videos found |
| FR-6 | Topic research agent searches authoritative domains, excludes low-quality sources |
| FR-7 | All agents use Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) |
| FR-8 | POST `/api/scripts/generate` accepts `{reportIds[], prompt, platform}` and returns `{jobId, status}` |
| FR-9 | Script generation produces 140-160 word scripts with specified structure |
| FR-10 | GET `/api/reports` returns paginated list of reports |
| FR-11 | GET `/api/reports/:id` returns single report with full content |
| FR-12 | PATCH `/api/reports/:id` updates report fields |
| FR-13 | DELETE `/api/reports/:id` removes report from database |
| FR-14 | GET `/api/scripts` returns paginated list of scripts |
| FR-15 | GET `/api/scripts/:id` returns single script |
| FR-16 | PATCH `/api/scripts/:id` updates script (content, title, status) |
| FR-17 | DELETE `/api/scripts/:id` removes script from database |
| FR-18 | All API errors return `{error: string, statusCode: number}` |

### Frontend

| ID | Requirement |
|----|-------------|
| FR-20 | Research page has three research type options (Book, Author, Topic) |
| FR-21 | Research form validates required fields before submission |
| FR-22 | Progress component polls job status every 2 seconds until complete |
| FR-23 | Completed research shows report preview with "View Full Report" option |
| FR-24 | Script Writer page shows selectable list of reports |
| FR-25 | Script Writer validates at least one report selected before generation |
| FR-26 | Generated script displays in editable format |
| FR-27 | Script editor shows live word count |
| FR-28 | Catalog page has tabs for Reports and Scripts |
| FR-29 | Catalog search filters items client-side in real-time |
| FR-30 | Loading states show skeleton placeholders (not spinners) |
| FR-31 | Error states show user-friendly messages with retry option |
| FR-32 | All interactive elements have minimum 44x44px touch target |

### PWA

| ID | Requirement |
|----|-------------|
| FR-40 | App has valid `manifest.json` with name, icons, theme color |
| FR-41 | App is installable on mobile devices |
| FR-42 | Service worker caches static assets for offline shell |
| FR-43 | Offline mode shows cached reports and scripts (read-only) |
| FR-44 | Online status indicator shows when offline |

---

## 5. Non-Goals (Out of Scope)

- **NG-1:** User authentication / multi-user support (single-user app for v1)
- **NG-2:** Video recording or teleprompter functionality
- **NG-3:** Direct publishing to YouTube/Instagram
- **NG-4:** Collaborative editing
- **NG-5:** Custom AI model fine-tuning
- **NG-6:** Analytics dashboard
- **NG-7:** Monetization features
- **NG-8:** Desktop-only features (mobile-first priority)

---

## 6. Design Considerations

### Visual Style
- **Aesthetic:** Clean, minimal, professional. No flashy colors or animations.
- **Colors:** Neutral grays, single accent color (blue-600), dark text on light background
- **Typography:** System font stack, clear hierarchy (16px base, 14px secondary)
- **Spacing:** Generous whitespace (minimum p-4 padding, gap-4 between elements)
- **Cards:** Subtle borders (border-gray-200), rounded-lg, shadow-sm on hover

### Mobile-First Patterns
- Bottom sheet modals instead of centered modals
- Pull-to-refresh for catalog lists
- Swipe actions for delete (with confirmation)
- Sticky headers that collapse on scroll
- Large touch targets (minimum 44px)

### Component Reuse
- `Card` component for reports, scripts, and selection items
- `Badge` component for type/status indicators
- `Button` variants: primary, secondary, ghost, danger
- `Input` and `TextArea` with consistent styling
- `ProgressBar` for job progress
- `Skeleton` variants for loading states
- `Toast` for confirmations and errors

---

## 7. Technical Considerations

### Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB Atlas (cloud)
- **AI:** Anthropic Claude Sonnet 4.5 via SDK
- **Web Search:** Tavily API
- **YouTube:** youtube-transcript package

### Architecture Decisions
- **Job Queue:** In-memory for v1, upgrade to Redis/BullMQ for production
- **State Management:** React Context + useReducer (no Redux needed)
- **API Client:** Native fetch with typed wrappers
- **PWA:** Workbox for service worker generation

### Environment Variables
```
# Backend (server/.env)
PORT=3001
MONGODB_URI=mongodb+srv://...
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
AI_PROVIDER=anthropic

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3001
```

### Deployment Considerations
- Frontend: Vercel, Netlify, or Replit
- Backend: Replit, Railway, or Render
- Database: MongoDB Atlas (already configured)
- CORS: Configure for production domains

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Research completion rate | >95% of jobs complete without error |
| Research time (book) | <45 seconds |
| Research time (author/topic) | <90 seconds |
| Script generation time | <30 seconds |
| Mobile Lighthouse score | >90 performance, >90 PWA |
| Time to first script (new user) | <5 minutes |
| Script word count accuracy | 140-160 words in >90% of generations |

---

## 9. Open Questions

- **OQ-1:** Should the app support multiple languages or English only for v1?
- **OQ-2:** What happens when Tavily/YouTube APIs fail? Graceful degradation or error?
- **OQ-3:** Should reports have a "regenerate" option with the same inputs?
- **OQ-4:** How long should job results be cached in memory before cleanup?
- **OQ-5:** Should there be a "favorites" or tagging system for organizing content?
- **OQ-6:** Is there a maximum number of reports/scripts per user (storage limits)?

---

## Implementation Priority

### Phase 1: Core Backend (Current)
- [x] MongoDB connection
- [x] Report and Script models
- [x] AI provider abstraction (Claude Sonnet 4.5)
- [x] Book research agent
- [x] Author research agent (web + YouTube)
- [x] Topic research agent (web)
- [x] Job manager
- [x] API routes

### Phase 2: Frontend Foundation
- [x] React + Vite + Tailwind setup
- [x] Routing (React Router)
- [x] Layout (Header, Bottom Nav)
- [x] Loading skeletons
- [x] Error boundaries
- [ ] Connect to real API (in progress)
- [ ] Research page with all three types
- [ ] Progress polling and display

### Phase 3: Script Generation
- [ ] Report selection UI
- [ ] Script generation form
- [ ] Script editor with word count
- [ ] Copy to clipboard

### Phase 4: Catalog & Polish
- [ ] Reports catalog with search
- [ ] Scripts catalog with search
- [ ] Delete functionality
- [ ] Toast notifications
- [ ] Mobile gesture support

### Phase 5: PWA
- [ ] Manifest.json
- [ ] Service worker
- [ ] Offline caching
- [ ] Install prompts

---

*Generated for ScriptWriter project - Last updated: 2026-01-10*
