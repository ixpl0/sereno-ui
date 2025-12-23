# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm dev:mock         # Start dev server with mock API
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # Run TypeScript type checking
pnpm generate:api     # Generate API client from swagger.yaml
pnpm storybook        # Start Storybook (http://localhost:6006)
pnpm build-storybook  # Build Storybook
pnpm test:e2e         # Run Playwright e2e tests
pnpm test:e2e:ui      # Run Playwright with UI mode
pnpm test:e2e:headed  # Run Playwright in headed browser
pnpm test:unit        # Run Vitest unit tests (watch mode)
pnpm test:unit:run    # Run Vitest unit tests once
pnpm test:unit:ui     # Run Vitest with UI mode
pnpm test:unit:coverage # Run Vitest with coverage
```

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 Composition API) with SSR
- **State**: Pinia (SSR-compatible)
- **Styling**: Tailwind CSS 4 (@tailwindcss/vite) + DaisyUI 5
- **API Client**: @hey-api/openapi-ts (generated from swagger.yaml)
- **Mocking**: MSW (Mock Service Worker)
- **Icons**: @nuxt/icon
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Deployment**: Vercel (auto-deploy)
- **Node**: >=22.12.0

## Project Structure

```
app/
├── api/              # Auto-generated API client (from swagger.yaml, do not edit)
├── assets/css/       # Global CSS (Tailwind, DaisyUI, animations)
├── components/ui/    # Reusable UI components (UiButton, UiInput, UiCard, etc.)
├── composables/      # Vue composables (useAuth, etc.)
├── layouts/          # Nuxt layouts (default, auth)
├── middleware/       # Route middleware (auth, guest)
├── mocks/            # MSW mock handlers and data
├── pages/            # Nuxt pages (file-based routing)
├── stores/           # Pinia stores
├── types/            # TypeScript types
├── utils/            # Utility functions
└── app.vue           # Root component
stories/              # Storybook stories
tests/
├── unit/             # Vitest unit tests
└── e2e/              # Playwright e2e tests
```

## Key Features

### SSR Support
- Full server-side rendering with Nuxt 4
- Cookie-based auth (works on SSR, no localStorage)
- Route middleware runs on server

### Mock API
- Run `pnpm dev:mock` to use MSW mocks instead of real API
- OAuth mock with multiple providers (Yandex, VK, Keycloak)
- Supports scenarios: success, cancel, error, timeout

### API Generation
- API client generated from `swagger.yaml` to `app/api/`
- Run `pnpm generate:api` after updating swagger
- Generated directory excluded from ESLint
- **IMPORTANT**: `swagger.yaml` is read-only and provided by backend team. Do not edit it manually.

## UI Components

All reusable UI elements in `app/components/ui/` with `Ui` prefix:

- **UiButton** - Buttons with variants (primary, secondary, ghost, etc.)
- **UiInput** - Text inputs with labels, validation states, autofocus
- **UiPinInput** - PIN/OTP code input with grouping and auto-focus
- **UiCard** - Cards with header/footer slots
- **UiTransition** - Transition wrapper with presets (fade, scale, slide)
- **UiLabel** - Form labels with required indicator
- **UiToast** - Toast notifications (success, error, warning, info)

### Global Animations

CSS animations in `app/assets/css/animations.css`:
- `animate-appear` - Scale + fade in with bounce
- `animate-fade-in` - Simple fade in
- `animate-slide-up` - Slide up + fade in

## Code Style

- TypeScript strict mode enabled
- Vue 3 Composition API with `<script setup lang="ts">`
- Prefer `ref` over `reactive`
- Use `const` and arrow functions
- Immutability: avoid mutations, use `map`/`filter`/`reduce`
- No `any` type - use `unknown` or generics
- No comments (except ESLint disables and TODOs)
- Always use blocks for `if`/`else`/`for`
- Empty line at end of files

## Testing Strategy

- **E2E tests (Playwright)** - UI components, pages, user flows
- **Unit tests (Vitest)** - utils, composables, pure functions
- **Storybook** - visual testing and component documentation

UI components are thin wrappers over DaisyUI with minimal logic. Testing DOM interactions (keyboard navigation, focus management) is more reliable with e2e tests than unit tests.

## Pre-commit

Husky runs `lint-staged` on commit, which applies ESLint fix to `*.{js,ts,vue,mjs}` files.
