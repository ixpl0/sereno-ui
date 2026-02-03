# Sereno UI

Frontend for Sereno incident management platform built with Nuxt 4.

**Demo:** [sereno-ui.vercel.app](https://sereno-ui.vercel.app)

## Features

- **SSR** — full server-side rendering, cookie-based auth
- **On-Call Schedules** — interactive timeline with day/week/month views, rotations, overrides
- **Incident Management** — alerts, incidents, status tracking, comments, labels
- **Escalation Policies** — configurable escalation rules
- **Teams** — multi-tenant support, team members, API tokens
- **Mock API** — run UI without backend (Nuxt server routes)
- **API Generation** — typed client from swagger.yaml (@hey-api/openapi-ts)
- **Content** — blog and docs powered by @nuxt/content
- **Auto-deploy** — Vercel deploys on push to main

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4 (Vue 3 Composition API) |
| State | Pinia (SSR-compatible) |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Icons | @nuxt/icon (heroicons, lucide) |
| Content | @nuxt/content |
| Drag & Drop | vuedraggable |
| Testing | Vitest (unit) + Playwright (e2e) |
| TypeScript | Strict mode |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  (dashboard, alerts, incidents, schedules, escalations)     │
├─────────────────────────────────────────────────────────────┤
│                      Composables                             │
│  useAuth, useAlerts, useIncidents, useSchedules, etc.       │
├─────────────────────────────────────────────────────────────┤
│                       Components                             │
│  ui/ | layout/ | schedule/ | event/ | escalation/           │
├─────────────────────────────────────────────────────────────┤
│                     API Client                               │
│  Generated from swagger.yaml (@hey-api/openapi-ts)          │
├─────────────────────────────────────────────────────────────┤
│                    Pinia Stores                              │
│  authStore (token, user state)                              │
└─────────────────────────────────────────────────────────────┘
```

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev        # Real API (requires backend)
pnpm dev:mock   # Mock API (standalone)
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm dev:mock` | Start with mock API |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm generate:api` | Generate API client from swagger |
| `pnpm storybook` | Start Storybook |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm test:e2e:ui` | Run Playwright with UI |
| `pnpm test:unit` | Run Vitest unit tests |
| `pnpm test:unit:run` | Run unit tests once |
| `pnpm test:unit:coverage` | Run with coverage |

## Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Utils, composables, pure functions |
| E2E | Playwright | User flows, pages, interactions |
| Visual | Storybook | Component documentation |

## Project Structure

```
app/
├── api/           # Generated API client (do not edit)
├── components/
│   ├── ui/        # Reusable UI (UiButton, UiInput, etc.)
│   ├── layout/    # App layout (header, sidebar)
│   ├── schedule/  # On-call timeline components
│   ├── event/     # Alert/incident components
│   └── escalation/# Escalation components
├── composables/   # Vue composables
├── pages/         # File-based routing
├── stores/        # Pinia stores
└── utils/         # Helper functions
server/
└── api/v1/        # Mock API routes
content/           # Markdown (blog, docs)
tests/
├── unit/          # Vitest tests
└── e2e/           # Playwright tests
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE_URL` | Backend API URL | - |
| `NUXT_PUBLIC_MOCK_API` | Enable mock API | `false` |

## License

Private
