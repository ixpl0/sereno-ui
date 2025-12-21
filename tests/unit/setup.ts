import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import {
  ref,
  computed,
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

vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watch', watch)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('onUnmounted', onUnmounted)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('useId', () => `id-${++idCounter}`)

const mockCookie = ref<string | null>(null)
vi.stubGlobal('useCookie', () => mockCookie)
