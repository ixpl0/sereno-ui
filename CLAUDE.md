# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

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
- **Mocking**: Nuxt server routes (server/api/)
- **Icons**: @nuxt/icon
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Deployment**: Vercel (auto-deploy)
- **Node**: >=22.12.0

## Project Structure

```
app/
├── api/              # Auto-generated API client (from swagger.yaml, do not edit)
├── assets/css/       # Global CSS (Tailwind, DaisyUI, animations)
├── components/
│   ├── ui/           # Reusable UI components (UiButton, UiInput, UiCard, etc.)
│   └── layout/       # Layout components (AppHeader, AppSidebar, UserDropdown, etc.)
├── composables/      # Vue composables (useAuth, useUser, useTenants, etc.)
├── layouts/          # Nuxt layouts (default, auth)
├── middleware/       # Route middleware (auth, guest)
├── pages/            # Nuxt pages (file-based routing)
├── plugins/          # Nuxt plugins (api.ts)
├── stores/           # Pinia stores
├── types/            # TypeScript types
├── utils/            # Utility functions (api, url, validation)
├── app.vue           # Root component
└── error.vue         # Error page
server/
├── api/v1/           # Mock API routes (used when mockApi=true)
└── utils/            # Mock data and helpers
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

#### SSR Hydration Mismatch Prevention

Common causes and solutions:

1. **Browser-only APIs (window, document)**
   - Wrap in `onMounted()` or use `<ClientOnly>` component
   - Example: `useBreakpoints` uses `isMounted` flag to return consistent values during SSR

2. **Cookies not available on server**
   - Always use `sameSite: 'lax'` in `useCookie()` options
   - Example: `useCookie('auth_token', { sameSite: 'lax' })`

3. **Dynamic content that differs server/client**
   - Wrap in `<ClientOnly>` component
   - Example: tokens, timestamps, user-specific data

4. **Responsive breakpoints**
   - `useBreakpoints` composable is SSR-safe
   - Returns `false` for all breakpoint checks until mounted
   - Use `watch` with `immediate: true` to update state after mount

#### Prerender and Protected Routes

**IMPORTANT**: Protected pages (requiring auth) must NOT be prerendered. Otherwise they get cached with empty data.

Configuration in `nuxt.config.ts`:
- `nitro.prerender.crawlLinks: true` - crawls links to find pages
- `nitro.prerender.ignore` - function that allows ONLY static pages (`/`, `/about`, `/pricing`, `/blog/**`, `/docs/**`)
- All other routes are automatically ignored from prerender

If adding new static public pages, add them to the `allowed` array in `nitro.prerender.ignore`.

Auth middleware (`app/middleware/auth.ts`):
- Uses `parseCookies` from `h3` to read cookies on server (must be imported!)
- Uses `useCookie` on client
- `useRequestEvent()` provides the H3 event for server-side cookie parsing

### Mock API
- Run `pnpm dev:mock` to use mock API instead of real backend
- Mocks implemented as Nuxt server routes in `server/api/v1/`
- Mock data stored in memory (`server/utils/mockData.ts`)
- OAuth mock with multiple providers (Yandex, VK, Keycloak)
- Supports scenarios: success, cancel, error, timeout

### API Generation
- API client generated from `swagger.yaml` to `app/api/`
- Run `pnpm generate:api` after updating swagger
- Generated directory excluded from ESLint
- **IMPORTANT**: `swagger.yaml` is read-only and provided by backend team. Do not edit it manually.

## Pages

```
pages/
├── index.vue                    # Landing/redirect page
├── dashboard.vue                # Main dashboard
├── profile.vue                  # User profile settings
├── alerts.vue                   # Alerts list
├── incidents.vue                # Incidents list
├── tenants/
│   ├── index.vue                # Teams list
│   └── [id].vue                 # Team details (members, tokens)
├── auth/
│   ├── index.vue                # OAuth provider selection
│   └── callback/[provider].vue  # OAuth callback handler
└── mock-oauth/[provider].vue    # Mock OAuth flow (dev only)
```

## Composables

All composables in `app/composables/`:

| Composable | Description |
|------------|-------------|
| **useAuth** | Authentication state, login/logout, OAuth flow |
| **useUser** | Current user data, profile updates (name, timezone, language) |
| **useSessions** | User sessions management, close other sessions |
| **useContacts** | User contacts (email, telegram), verification flow |
| **useTenants** | Teams list, create/update teams |
| **useTenantMembers** | Team members management (add, remove, set admin) |
| **useTenantTokens** | API tokens for teams (create, delete) |
| **useToast** | Toast notifications (success, error, warning, info) |
| **useTheme** | Theme preference (light, dark, system) with cookie persistence |
| **useBreakpoints** | Responsive breakpoints helper (greater, smaller) |

## Layout Components

Components in `app/components/layout/`:

- **AppHeader** - Main app header with logo and user menu
- **AppSidebar** - Navigation sidebar with menu items
- **AuthHeader** - Header for auth pages (logo only)
- **UserDropdown** - User avatar dropdown with profile/logout
- **ThemeSwitcher** - Theme toggle (light/dark/system)

## UI Components

All reusable UI elements in `app/components/ui/` with `Ui` prefix:

- **UiButton** - Buttons with variants (primary, secondary, ghost, etc.)
- **UiInput** - Text inputs with labels, validation states, autofocus
- **UiSelect** - Select dropdowns with consistent styling and focus effects
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

## Utils

Utility functions in `app/utils/`:

| File | Functions |
|------|-----------|
| **api.ts** | `isApiError`, `extractApiError`, `getApiData` - API response handling |
| **url.ts** | `isValidRedirectUrl`, `safeRedirect` - secure redirect validation |
| **validation.ts** | `isValidEmail`, `isValidTelegram` - input validation |

## Plugins

Nuxt plugins in `app/plugins/`:

- **api.ts** - Configures API client baseUrl for mock mode (`/api/v1`)

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
