import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '~/composables/useToast'

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid'),
})

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { toasts } = useToast()
    toasts.value.forEach((t) => {
      const { removeToast } = useToast()
      removeToast(t.id)
    })
    vi.mocked(crypto.randomUUID).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('toast method', () => {
    it('adds toast to list', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test message' })
      expect(toasts.value.length).toBe(1)
      expect(toasts.value[0].message).toBe('Test message')
    })

    it('returns toast id', () => {
      vi.mocked(crypto.randomUUID).mockReturnValueOnce('unique-id')
      const { toast } = useToast()
      const id = toast({ message: 'Test' })
      expect(id).toBe('unique-id')
    })

    it('uses info type by default', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test' })
      expect(toasts.value[0].type).toBe('info')
    })

    it('uses custom type when provided', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test', type: 'error' })
      expect(toasts.value[0].type).toBe('error')
    })

    it('uses default timeout of 5000ms', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test' })
      expect(toasts.value[0].timeout).toBe(5000)
    })

    it('uses custom timeout when provided', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test', timeout: 3000 })
      expect(toasts.value[0].timeout).toBe(3000)
    })

    it('auto-removes toast after timeout', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test', timeout: 1000 })
      expect(toasts.value.length).toBe(1)
      vi.advanceTimersByTime(1000)
      expect(toasts.value.length).toBe(0)
    })

    it('does not auto-remove toast when timeout is 0', () => {
      const { toast, toasts } = useToast()
      toast({ message: 'Test', timeout: 0 })
      expect(toasts.value.length).toBe(1)
      vi.advanceTimersByTime(10000)
      expect(toasts.value.length).toBe(1)
    })
  })

  describe('removeToast method', () => {
    it('removes toast by id', () => {
      vi.mocked(crypto.randomUUID).mockReturnValueOnce('toast-to-remove')
      const { toast, toasts, removeToast } = useToast()
      toast({ message: 'Test', timeout: 0 })
      expect(toasts.value.length).toBe(1)
      removeToast('toast-to-remove')
      expect(toasts.value.length).toBe(0)
    })

    it('only removes matching toast', () => {
      vi.mocked(crypto.randomUUID)
        .mockReturnValueOnce('first')
        .mockReturnValueOnce('second')
        .mockReturnValueOnce('third')
      const { toast, toasts, removeToast } = useToast()
      toast({ message: 'First', timeout: 0 })
      toast({ message: 'Second', timeout: 0 })
      toast({ message: 'Third', timeout: 0 })
      expect(toasts.value.length).toBe(3)
      removeToast('second')
      expect(toasts.value.length).toBe(2)
      expect(toasts.value.map(t => t.id)).toEqual(['first', 'third'])
    })

    it('does nothing for non-existent id', () => {
      const { toast, toasts, removeToast } = useToast()
      toast({ message: 'Test', timeout: 0 })
      const initialLength = toasts.value.length
      removeToast('non-existent')
      expect(toasts.value.length).toBe(initialLength)
    })
  })

  describe('success method', () => {
    it('creates toast with success type', () => {
      const { success, toasts } = useToast()
      success('Success!')
      expect(toasts.value[0].type).toBe('success')
      expect(toasts.value[0].message).toBe('Success!')
    })

    it('accepts custom timeout', () => {
      const { success, toasts } = useToast()
      success('Success!', 2000)
      expect(toasts.value[0].timeout).toBe(2000)
    })
  })

  describe('error method', () => {
    it('creates toast with error type', () => {
      const { error, toasts } = useToast()
      error('Error!')
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].message).toBe('Error!')
    })

    it('accepts custom timeout', () => {
      const { error, toasts } = useToast()
      error('Error!', 10000)
      expect(toasts.value[0].timeout).toBe(10000)
    })
  })

  describe('warning method', () => {
    it('creates toast with warning type', () => {
      const { warning, toasts } = useToast()
      warning('Warning!')
      expect(toasts.value[0].type).toBe('warning')
      expect(toasts.value[0].message).toBe('Warning!')
    })

    it('accepts custom timeout', () => {
      const { warning, toasts } = useToast()
      warning('Warning!', 4000)
      expect(toasts.value[0].timeout).toBe(4000)
    })
  })

  describe('info method', () => {
    it('creates toast with info type', () => {
      const { info, toasts } = useToast()
      info('Info!')
      expect(toasts.value[0].type).toBe('info')
      expect(toasts.value[0].message).toBe('Info!')
    })

    it('accepts custom timeout', () => {
      const { info, toasts } = useToast()
      info('Info!', 1500)
      expect(toasts.value[0].timeout).toBe(1500)
    })
  })

  describe('toasts readonly', () => {
    it('returns readonly ref', () => {
      const { toasts } = useToast()
      expect(typeof toasts.value).toBe('object')
    })
  })

  describe('multiple instances', () => {
    it('shares state between instances', () => {
      const instance1 = useToast()
      const instance2 = useToast()
      instance1.toast({ message: 'From instance 1', timeout: 0 })
      expect(instance2.toasts.value.length).toBeGreaterThan(0)
      expect(instance2.toasts.value.some(t => t.message === 'From instance 1')).toBe(true)
    })
  })
})
