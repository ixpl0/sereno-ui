import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiPinInput from '~/components/ui/UiPinInput.vue'
import UiLabel from '~/components/ui/UiLabel.vue'

vi.mock('#imports', () => ({
  useId: () => 'test-id',
  computed: (fn: () => unknown) => ({ value: fn() }),
  ref: <T>(val: T) => ({ value: val }),
  onMounted: (fn: () => void) => fn(),
  watch: vi.fn(),
}))

const globalConfig = {
  components: { UiLabel },
}

describe('UiPinInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('rendering', () => {
    it('renders 8 input elements by default', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      expect(wrapper.findAll('input').length).toBe(8)
    })

    it('renders custom number of inputs based on length prop', () => {
      const wrapper = mount(UiPinInput, {
        props: { length: 6 },
        global: globalConfig,
      })
      expect(wrapper.findAll('input').length).toBe(6)
    })

    it('renders inputs with numeric inputmode', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      const input = wrapper.find('input')
      expect(input.attributes('inputmode')).toBe('numeric')
    })

    it('renders inputs with maxlength 1', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      const input = wrapper.find('input')
      expect(input.attributes('maxlength')).toBe('1')
    })
  })

  describe('grouping', () => {
    it('creates groups of 4 by default', () => {
      const wrapper = mount(UiPinInput, {
        props: { length: 8 },
        global: globalConfig,
      })
      const separators = wrapper.findAll('.w-3.h-0\\.5')
      expect(separators.length).toBe(1)
    })

    it('creates custom groups based on groupSize prop', () => {
      const wrapper = mount(UiPinInput, {
        props: { length: 6, groupSize: 3 },
        global: globalConfig,
      })
      const separators = wrapper.findAll('.w-3.h-0\\.5')
      expect(separators.length).toBe(1)
    })

    it('creates multiple separators for more groups', () => {
      const wrapper = mount(UiPinInput, {
        props: { length: 9, groupSize: 3 },
        global: globalConfig,
      })
      const separators = wrapper.findAll('.w-3.h-0\\.5')
      expect(separators.length).toBe(2)
    })
  })

  describe('v-model', () => {
    it('displays modelValue in inputs', () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '1234', length: 4 },
        global: globalConfig,
      })
      const inputs = wrapper.findAll('input')
      expect((inputs[0].element as HTMLInputElement).value).toBe('1')
      expect((inputs[1].element as HTMLInputElement).value).toBe('2')
      expect((inputs[2].element as HTMLInputElement).value).toBe('3')
      expect((inputs[3].element as HTMLInputElement).value).toBe('4')
    })

    it('emits update:modelValue on input', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const input = wrapper.find('input')
      await input.setValue('5')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits complete when all digits entered', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '123', length: 4 },
        global: globalConfig,
      })
      const inputs = wrapper.findAll('input')
      await inputs[3].setValue('4')
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0]).toEqual(['1234'])
    })
  })

  describe('input filtering', () => {
    it('only accepts digits', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const input = wrapper.find('input')
      await input.setValue('a')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('takes only last digit when multiple entered', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const input = wrapper.find('input')
      await input.setValue('123')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['3'])
    })
  })

  describe('states', () => {
    it('applies default state classes', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      const input = wrapper.find('input')
      expect(input.classes()).toContain('border-base-content/20')
    })

    it('applies error state classes', () => {
      const wrapper = mount(UiPinInput, {
        props: { state: 'error' },
        global: globalConfig,
      })
      const input = wrapper.find('input')
      expect(input.classes()).toContain('border-error')
    })

    it('applies success state classes', () => {
      const wrapper = mount(UiPinInput, {
        props: { state: 'success' },
        global: globalConfig,
      })
      const input = wrapper.find('input')
      expect(input.classes()).toContain('border-success')
    })
  })

  describe('disabled state', () => {
    it('disables all inputs when disabled prop is true', () => {
      const wrapper = mount(UiPinInput, {
        props: { disabled: true },
        global: globalConfig,
      })
      const inputs = wrapper.findAll('input')
      inputs.forEach((input) => {
        expect(input.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('label', () => {
    it('shows label when provided', () => {
      const wrapper = mount(UiPinInput, {
        props: { label: 'Enter code' },
        global: globalConfig,
      })
      expect(wrapper.text()).toContain('Enter code')
    })

    it('does not show label when not provided', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      expect(wrapper.findComponent(UiLabel).exists()).toBe(false)
    })

    it('passes required to label', () => {
      const wrapper = mount(UiPinInput, {
        props: { label: 'Code', required: true },
        global: globalConfig,
      })
      const label = wrapper.findComponent(UiLabel)
      expect(label.props('required')).toBe(true)
    })
  })

  describe('focus method', () => {
    it('exposes focus method', () => {
      const wrapper = mount(UiPinInput, {
        global: globalConfig,
      })
      expect(typeof wrapper.vm.focus).toBe('function')
    })
  })

  describe('keyboard navigation', () => {
    it('moves focus to previous input on Backspace when current is empty', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '12', length: 4 },
        global: globalConfig,
        attachTo: document.body,
      })
      const inputs = wrapper.findAll('input')
      await inputs[2].trigger('keydown', { key: 'Backspace' })
      expect(document.activeElement).toBe(inputs[1].element)
      wrapper.unmount()
    })

    it('clears current input on Backspace when has value', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '123', length: 4 },
        global: globalConfig,
      })
      const inputs = wrapper.findAll('input')
      await inputs[2].trigger('keydown', { key: 'Backspace' })
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[emitted.length - 1]).toEqual(['12'])
    })

    it('moves focus left on ArrowLeft', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '1234', length: 4 },
        global: globalConfig,
        attachTo: document.body,
      })
      const inputs = wrapper.findAll('input')
      await inputs[2].trigger('keydown', { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(inputs[1].element)
      wrapper.unmount()
    })

    it('moves focus right on ArrowRight', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '1234', length: 4 },
        global: globalConfig,
        attachTo: document.body,
      })
      const inputs = wrapper.findAll('input')
      await inputs[1].trigger('keydown', { key: 'ArrowRight' })
      expect(document.activeElement).toBe(inputs[2].element)
      wrapper.unmount()
    })

    it('does not move focus beyond first input on ArrowLeft', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '1234', length: 4 },
        global: globalConfig,
        attachTo: document.body,
      })
      const inputs = wrapper.findAll('input')
      await inputs[0].element.focus()
      await inputs[0].trigger('keydown', { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(inputs[0].element)
      wrapper.unmount()
    })

    it('does not move focus beyond last input on ArrowRight', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '1234', length: 4 },
        global: globalConfig,
        attachTo: document.body,
      })
      const inputs = wrapper.findAll('input')
      await inputs[3].element.focus()
      await inputs[3].trigger('keydown', { key: 'ArrowRight' })
      expect(document.activeElement).toBe(inputs[3].element)
      wrapper.unmount()
    })
  })

  describe('paste handling', () => {
    it('fills inputs from pasted text', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const container = wrapper.find('.flex.items-center')
      await container.trigger('paste', {
        clipboardData: { getData: () => '1234' },
      })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1234'])
    })

    it('filters non-digits from pasted text', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const container = wrapper.find('.flex.items-center')
      await container.trigger('paste', {
        clipboardData: { getData: () => 'a1b2c3d4' },
      })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1234'])
    })

    it('truncates pasted text to length', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const container = wrapper.find('.flex.items-center')
      await container.trigger('paste', {
        clipboardData: { getData: () => '12345678' },
      })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1234'])
    })

    it('emits complete after pasting full code', async () => {
      const wrapper = mount(UiPinInput, {
        props: { modelValue: '', length: 4 },
        global: globalConfig,
      })
      const container = wrapper.find('.flex.items-center')
      await container.trigger('paste', {
        clipboardData: { getData: () => '1234' },
      })
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0]).toEqual(['1234'])
    })
  })
})
