import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiModal from '~/components/ui/UiModal.vue'
import UiCard from '~/components/ui/UiCard.vue'
import UiTransition from '~/components/ui/UiTransition.vue'

vi.mock('#imports', () => ({
  ref: <T>(val: T) => ({ value: val }),
  computed: (fn: () => unknown) => ({ value: fn() }),
  watch: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  nextTick: () => Promise.resolve(),
}))

describe('UiModal', () => {
  const globalConfig = {
    stubs: {
      Teleport: true,
      UiTransition: {
        template: '<div><slot /></div>',
      },
    },
    components: { UiCard, UiTransition },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('does not render when closed', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: false },
        global: globalConfig,
      })
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('renders when open', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })

    it('renders slot content', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        slots: { default: '<p class="modal-content">Modal content</p>' },
        global: globalConfig,
      })
      expect(wrapper.find('.modal-content').exists()).toBe(true)
    })

    it('renders title when provided', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, title: 'Modal Title' },
        global: globalConfig,
      })
      expect(wrapper.text()).toContain('Modal Title')
    })

    it('renders footer slot', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        slots: {
          default: 'Content',
          footer: '<button class="footer-btn">Save</button>',
        },
        global: globalConfig,
      })
      expect(wrapper.find('.footer-btn').exists()).toBe(true)
    })
  })

  describe('sizes', () => {
    it('applies md size by default', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('.max-w-md').exists()).toBe(true)
    })

    it('applies sm size', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, size: 'sm' },
        global: globalConfig,
      })
      expect(wrapper.find('.max-w-sm').exists()).toBe(true)
    })

    it('applies lg size', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, size: 'lg' },
        global: globalConfig,
      })
      expect(wrapper.find('.max-w-lg').exists()).toBe(true)
    })

    it('applies xl size', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, size: 'xl' },
        global: globalConfig,
      })
      expect(wrapper.find('.max-w-xl').exists()).toBe(true)
    })
  })

  describe('close button', () => {
    it('shows close button by default', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('button[aria-label="Закрыть"]').exists()).toBe(true)
    })

    it('hides close button when closable is false', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, closable: false },
        global: globalConfig,
      })
      expect(wrapper.find('button[aria-label="Закрыть"]').exists()).toBe(false)
    })

    it('emits update:modelValue false on close button click', async () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      await wrapper.find('button[aria-label="Закрыть"]').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })

  describe('backdrop', () => {
    it('emits close on backdrop click by default', async () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      const backdrop = wrapper.find('.bg-black\\/50')
      await backdrop.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('does not emit close on backdrop click when closeOnBackdrop is false', async () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, closeOnBackdrop: false },
        global: globalConfig,
      })
      const backdrop = wrapper.find('.bg-black\\/50')
      await backdrop.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('accessibility', () => {
    it('has role dialog', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })

    it('has aria-modal true', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('[aria-modal="true"]').exists()).toBe(true)
    })

    it('has aria-labelledby when title provided', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, title: 'Test Title' },
        global: globalConfig,
      })
      expect(wrapper.find('[aria-labelledby="modal-title"]').exists()).toBe(true)
    })

    it('has no aria-labelledby without title', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.attributes('aria-labelledby')).toBeUndefined()
    })

    it('backdrop has aria-hidden', () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true },
        global: globalConfig,
      })
      expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
    })
  })

  describe('closable prop', () => {
    it('does not close on close button when closable is false', async () => {
      const wrapper = mount(UiModal, {
        props: { modelValue: true, closable: false },
        global: globalConfig,
      })
      expect(wrapper.find('button[aria-label="Закрыть"]').exists()).toBe(false)
    })
  })
})
