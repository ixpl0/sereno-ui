import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import {
  ref,
  computed,
  readonly,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue'

config.global.stubs = {
  NuxtLink: true,
  ClientOnly: true,
  Teleport: true,
  Icon: true,
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

let idCounter = 0
const stateStore = new Map<string, ReturnType<typeof ref>>()

vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('readonly', readonly)
vi.stubGlobal('watch', watch)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('onUnmounted', onUnmounted)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('useId', () => `id-${++idCounter}`)
vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useSeoMeta', () => {})
vi.stubGlobal('createError', (opts: { message: string }) => new Error(opts.message))

vi.stubGlobal('useState', <T>(key: string, init?: () => T) => {
  if (!stateStore.has(key)) {
    stateStore.set(key, ref(init?.()))
  }
  return stateStore.get(key)!
})

const mockCookie = ref<string | null>(null)
vi.stubGlobal('useCookie', () => mockCookie)
