# Sereno UI

Frontend for the Sereno incident management platform, built with Nuxt 4.

Demo: https://sereno-ui.vercel.app

## Prerequisites

- Node.js `>=22.12.0`
- `pnpm`

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev        # Real backend API
pnpm dev:mock   # Local mock API (no backend required)
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm dev:mock` | Start development server with mock API |
| `pnpm build` | Build production bundle |
| `pnpm build:mock` | Build production bundle with mock API enabled |
| `pnpm generate` | Generate static output |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with autofix |
| `pnpm typecheck` | Run Nuxt TypeScript checks |
| `pnpm generate:api` | Regenerate API client from `swagger.yaml` |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build Storybook |
| `pnpm test:unit` | Run Vitest in watch mode |
| `pnpm test:unit:ui` | Run Vitest UI |
| `pnpm test:unit:run` | Run unit tests once |
| `pnpm test:unit:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm test:e2e:ui` | Run Playwright in UI mode |
| `pnpm test:e2e:headed` | Run Playwright in headed mode |

## Environment Variables

Copy `.env.example` to `.env.local` and adjust values if needed.

| Variable | Description | Default |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `NUXT_PUBLIC_MOCK_API` | Enable local mock API | `false` |

## Tech Stack

- Nuxt 4 (Vue 3 Composition API, SSR)
- Pinia
- Tailwind CSS 4 + DaisyUI 5
- @nuxt/content
- @nuxt/icon
- vuedraggable
- Vitest + Playwright
- API client generation via `@hey-api/openapi-ts`

## Route Overview

Public:

- `/`
- `/about`
- `/pricing`
- `/blog`
- `/blog/[...slug]`
- `/docs`
- `/docs/[...slug]`

Application:

- `/dashboard`
- `/profile`
- `/alerts`
- `/alerts/[id]`
- `/incidents`
- `/incidents/create`
- `/incidents/[id]`
- `/schedules`
- `/escalations`
- `/teams`
- `/teams/[id]`
- `/auth`
- `/auth/callback/[provider]`
- `/mock-oauth/[provider]` (dev/testing flow)

## Project Structure

```text
app/
  api/              Generated API client (do not edit manually)
  assets/           Global CSS
  components/       UI, layout, schedule, event, escalation, content
  composables/      Business logic composables
  layouts/          Nuxt layouts
  middleware/       Route guards
  pages/            File-based routes
  plugins/          Nuxt plugins (API setup)
  stores/           Pinia stores
  utils/            Utility helpers
server/
  api/v1/           Mock API handlers
content/            Blog and docs markdown
tests/
  unit/             Vitest tests
  e2e/              Playwright tests
```

## Notes

- `app/api/` is generated from `swagger.yaml`. Run `pnpm generate:api` after API schema updates.
- The project uses cookie-based authentication for SSR compatibility.
- Static prerendering is enabled only for public pages (`/`, `/about`, `/pricing`, `/blog/**`, `/docs/**`).

## License

Private
