import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UiToast from '~/components/ui/UiToast.vue'
import type { ToastMessage } from '~/composables/useToast'

const mockToasts = ref<ToastMessage[]>([])
const mockRemoveToast = vi.fn()

vi.stubGlobal('useToast', () => ({
  toasts: mockToasts,
  removeToast: mockRemoveToast,
}))

describe('UiToast', () => {
  beforeEach(() => {
    mockToasts.value = []
    mockRemoveToast.mockClear()
  })

  describe('rendering', () => {
    it('renders toast container', () => {
      const wrapper = mount(UiToast)
      expect(wrapper.find('.toast').exists()).toBe(true)
    })

    it('renders container with correct positioning classes', () => {
      const wrapper = mount(UiToast)
      const container = wrapper.find('.toast')
      expect(container.classes()).toContain('toast-top')
      expect(container.classes()).toContain('toast-end')
    })

    it('renders no toasts when list is empty', () => {
      const wrapper = mount(UiToast)
      expect(wrapper.findAll('.alert').length).toBe(0)
    })
  })

  describe('toast display', () => {
    it('renders single toast', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Test message', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.findAll('.alert').length).toBe(1)
      expect(wrapper.text()).toContain('Test message')
    })

    it('renders multiple toasts', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'First', timeout: 5000 },
        { id: '2', type: 'success', message: 'Second', timeout: 5000 },
        { id: '3', type: 'error', message: 'Third', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.findAll('.alert').length).toBe(3)
    })

    it('displays toast message text', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Hello World', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.text()).toContain('Hello World')
    })
  })

  describe('toast types', () => {
    it('applies success alert class', () => {
      mockToasts.value = [
        { id: '1', type: 'success', message: 'Success!', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('alert-success')
    })

    it('applies error alert class', () => {
      mockToasts.value = [
        { id: '1', type: 'error', message: 'Error!', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('alert-error')
    })

    it('applies warning alert class', () => {
      mockToasts.value = [
        { id: '1', type: 'warning', message: 'Warning!', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('alert-warning')
    })

    it('applies info alert class', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Info!', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('alert-info')
    })
  })

  describe('data-testid', () => {
    it('sets correct data-testid for success toast', () => {
      mockToasts.value = [
        { id: '1', type: 'success', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('[data-testid="toast-success"]').exists()).toBe(true)
    })

    it('sets correct data-testid for error toast', () => {
      mockToasts.value = [
        { id: '1', type: 'error', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('[data-testid="toast-error"]').exists()).toBe(true)
    })

    it('sets correct data-testid for warning toast', () => {
      mockToasts.value = [
        { id: '1', type: 'warning', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('[data-testid="toast-warning"]').exists()).toBe(true)
    })

    it('sets correct data-testid for info toast', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('[data-testid="toast-info"]').exists()).toBe(true)
    })
  })

  describe('interaction', () => {
    it('calls removeToast on click', async () => {
      mockToasts.value = [
        { id: 'toast-1', type: 'info', message: 'Click me', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      await wrapper.find('.alert').trigger('click')
      expect(mockRemoveToast).toHaveBeenCalledWith('toast-1')
    })

    it('calls removeToast with correct id when multiple toasts', async () => {
      mockToasts.value = [
        { id: 'first', type: 'info', message: 'First', timeout: 5000 },
        { id: 'second', type: 'success', message: 'Second', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      const alerts = wrapper.findAll('.alert')
      await alerts[1].trigger('click')
      expect(mockRemoveToast).toHaveBeenCalledWith('second')
    })

    it('has cursor-pointer class for clickability indication', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('cursor-pointer')
    })
  })

  describe('styling', () => {
    it('has shadow-lg class', () => {
      mockToasts.value = [
        { id: '1', type: 'info', message: 'Test', timeout: 5000 },
      ]
      const wrapper = mount(UiToast)
      expect(wrapper.find('.alert').classes()).toContain('shadow-lg')
    })

    it('has high z-index for visibility', () => {
      const wrapper = mount(UiToast)
      expect(wrapper.find('.toast').classes()).toContain('z-[99999]')
    })
  })
})
