# Sereno UI

Frontend for Sereno platform built with Nuxt 4.

**Demo:** [sereno-ui.vercel.app](https://sereno-ui.vercel.app)

## Features

- **SSR** — full server-side rendering, cookie-based auth
- **Mock API** — run UI on mocks without real backend (Nuxt server routes)
- **API Generation** — typed API client from swagger.yaml (@hey-api/openapi-ts)
- **E2E Tests** — Playwright tests for auth flows
- **UI Components** — reusable components with animations
- **Auto-deploy** — Vercel deploys on push to main

## Tech Stack

- Nuxt 4 (Vue 3 Composition API)
- Tailwind CSS 4 + DaisyUI 5
- Pinia (SSR-compatible state)
- TypeScript (strict mode)
- Playwright (e2e)
- Storybook

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev        # Real API
pnpm dev:mock   # Mock API
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm dev:mock` | Start with mock API |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm storybook` | Start Storybook |
| `pnpm generate:api` | Generate API client from swagger |
