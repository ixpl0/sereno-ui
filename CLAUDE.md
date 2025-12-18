# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
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
```

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 Composition API)
- **State**: Pinia
- **Styling**: Tailwind CSS 4 (@tailwindcss/vite) + DaisyUI 5
- **API Client**: @hey-api/openapi-ts (generated from swagger.yaml)
- **Icons**: @nuxt/icon
- **Testing**: Playwright (e2e)
- **Node**: >=22.12.0

## Project Structure

```
app/
├── api/           # Auto-generated API client (from swagger.yaml, do not edit manually)
├── assets/css/    # Global CSS (Tailwind + DaisyUI)
├── components/ui/ # Reusable UI components (UiButton, UiInput, UiModal, etc.)
├── pages/         # Nuxt pages (file-based routing)
└── app.vue        # Root component
stories/           # Storybook stories (excluded from ESLint)
tests/e2e/         # Playwright e2e tests
```

## UI Components

All visual/reusable UI elements must be placed in `app/components/ui/` with `Ui` prefix:

- **UiButton** - Buttons with variants (primary, secondary, ghost, etc.)
- **UiInput** - Text inputs with labels and validation states
- **UiModal** - Modal dialogs with smooth open/close animations

### Design Guidelines

- Use smooth, elegant animations for interactions (hover, focus, open/close)
- Leverage DaisyUI component classes as base, extend with custom animations
- Modal animations: fade + scale for opening, reverse for closing
- Inputs/buttons: subtle transitions on hover/focus states
- Keep animations performant (use `transform` and `opacity`)

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

## Pre-commit

Husky runs `lint-staged` on commit, which applies ESLint fix to `*.{js,ts,vue,mjs}` files.

## API Generation

API client is generated from `swagger.yaml` to `app/api/`. Run `pnpm generate:api` after updating the swagger file. The generated `app/api/` directory is excluded from ESLint.
