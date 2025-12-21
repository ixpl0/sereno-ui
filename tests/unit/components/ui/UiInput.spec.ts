import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '~/components/ui/UiInput.vue'
import UiLabel from '~/components/ui/UiLabel.vue'

vi.mock('#imports', () => ({
  useId: () => 'test-id',
  computed: (fn: () => unknown) => ({ value: fn() }),
  ref: <T>(val: T) => ({ value: val }),
  onMounted: (fn: () => void) => fn(),
}))

describe('UiInput', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      const wrapper = mount(UiInput, {
        global: {
          components: { UiLabel },
        },
      })
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders as text type by default', () => {
      const wrapper = mount(UiInput, {
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('type')).toBe('text')
    })
  })

  describe('v-model', () => {
    it('displays modelValue', () => {
      const wrapper = mount(UiInput, {
        props: { modelValue: 'test value' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').element.value).toBe('test value')
    })

    it('emits update:modelValue on input', async () => {
      const wrapper = mount(UiInput, {
        props: { modelValue: '' },
        global: { components: { UiLabel } },
      })
      await wrapper.find('input').setValue('new value')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })
  })

  describe('input types', () => {
    it('renders email type', () => {
      const wrapper = mount(UiInput, {
        props: { type: 'email' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('renders password type', () => {
      const wrapper = mount(UiInput, {
        props: { type: 'password' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('renders number type', () => {
      const wrapper = mount(UiInput, {
        props: { type: 'number' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('type')).toBe('number')
    })
  })

  describe('label and hint', () => {
    it('shows label when provided', () => {
      const wrapper = mount(UiInput, {
        props: { label: 'Email' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.text()).toContain('Email')
    })

    it('shows hint when provided', () => {
      const wrapper = mount(UiInput, {
        props: { hint: 'Enter your email address' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.text()).toContain('Enter your email address')
    })

    it('does not show hint element when no hint', () => {
      const wrapper = mount(UiInput, {
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('p.label').exists()).toBe(false)
    })
  })

  describe('states', () => {
    it('applies error state class', () => {
      const wrapper = mount(UiInput, {
        props: { state: 'error' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-error')
    })

    it('applies success state class', () => {
      const wrapper = mount(UiInput, {
        props: { state: 'success' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-success')
    })

    it('applies warning state class', () => {
      const wrapper = mount(UiInput, {
        props: { state: 'warning' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-warning')
    })

    it('sets aria-invalid on error', () => {
      const wrapper = mount(UiInput, {
        props: { state: 'error' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('hint has error color on error state', () => {
      const wrapper = mount(UiInput, {
        props: { state: 'error', hint: 'Error message' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('p.label').classes()).toContain('text-error')
    })
  })

  describe('variants', () => {
    it('applies bordered variant by default', () => {
      const wrapper = mount(UiInput, {
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-bordered')
    })

    it('applies ghost variant', () => {
      const wrapper = mount(UiInput, {
        props: { variant: 'ghost' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-ghost')
    })
  })

  describe('sizes', () => {
    it('applies xs size', () => {
      const wrapper = mount(UiInput, {
        props: { size: 'xs' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-xs')
    })

    it('applies sm size', () => {
      const wrapper = mount(UiInput, {
        props: { size: 'sm' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-sm')
    })

    it('applies lg size', () => {
      const wrapper = mount(UiInput, {
        props: { size: 'lg' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').classes()).toContain('input-lg')
    })
  })

  describe('attributes', () => {
    it('sets placeholder', () => {
      const wrapper = mount(UiInput, {
        props: { placeholder: 'Enter text' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
    })

    it('sets disabled', () => {
      const wrapper = mount(UiInput, {
        props: { disabled: true },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('sets required', () => {
      const wrapper = mount(UiInput, {
        props: { required: true },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('required')).toBeDefined()
    })

    it('sets maxlength', () => {
      const wrapper = mount(UiInput, {
        props: { maxlength: 50 },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('maxlength')).toBe('50')
    })

    it('sets autocomplete', () => {
      const wrapper = mount(UiInput, {
        props: { autocomplete: 'email' },
        global: { components: { UiLabel } },
      })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('email')
    })
  })

  describe('focus method', () => {
    it('exposes focus method', () => {
      const wrapper = mount(UiInput, {
        global: { components: { UiLabel } },
      })
      expect(typeof wrapper.vm.focus).toBe('function')
    })
  })
})
