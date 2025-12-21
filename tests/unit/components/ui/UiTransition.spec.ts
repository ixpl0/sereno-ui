import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiTransition from '~/components/ui/UiTransition.vue'

describe('UiTransition', () => {
  describe('rendering', () => {
    it('renders slot content', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div class="test-content">Content</div>' },
      })
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('renders with fade preset by default', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.preset).toBe('fade')
    })
  })

  describe('presets', () => {
    const presets = ['fade', 'scale', 'scale-bounce', 'slide-up', 'slide-down', 'slide-left', 'slide-right'] as const

    presets.forEach((preset) => {
      it(`accepts ${preset} preset`, () => {
        const wrapper = mount(UiTransition, {
          props: { preset },
          slots: { default: '<div>Content</div>' },
        })
        expect(wrapper.vm.$props.preset).toBe(preset)
      })
    })
  })

  describe('duration', () => {
    it('uses normal duration by default', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe('normal')
      expect(wrapper.classes()).toContain('ui-duration-normal')
    })

    it('accepts fast duration', () => {
      const wrapper = mount(UiTransition, {
        props: { duration: 'fast' },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe('fast')
      expect(wrapper.classes()).toContain('ui-duration-fast')
    })

    it('accepts slow duration', () => {
      const wrapper = mount(UiTransition, {
        props: { duration: 'slow' },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe('slow')
      expect(wrapper.classes()).toContain('ui-duration-slow')
    })

    it('accepts slower duration', () => {
      const wrapper = mount(UiTransition, {
        props: { duration: 'slower' },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe('slower')
      expect(wrapper.classes()).toContain('ui-duration-slower')
    })
  })

  describe('appear', () => {
    it('defaults to false', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.appear).toBe(false)
    })

    it('can be enabled', () => {
      const wrapper = mount(UiTransition, {
        props: { appear: true },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.appear).toBe(true)
    })
  })

  describe('mode', () => {
    it('defaults to default mode', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.mode).toBe('default')
    })

    it('accepts out-in mode', () => {
      const wrapper = mount(UiTransition, {
        props: { mode: 'out-in' },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.mode).toBe('out-in')
    })

    it('accepts in-out mode', () => {
      const wrapper = mount(UiTransition, {
        props: { mode: 'in-out' },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.mode).toBe('in-out')
    })
  })
})
