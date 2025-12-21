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
    it('uses 200ms by default', () => {
      const wrapper = mount(UiTransition, {
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe(200)
      expect(wrapper.html()).toContain('--ui-transition-duration: 200ms')
    })

    it('uses custom duration', () => {
      const wrapper = mount(UiTransition, {
        props: { duration: 500 },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.vm.$props.duration).toBe(500)
      expect(wrapper.html()).toContain('--ui-transition-duration: 500ms')
    })

    it('accepts very short duration', () => {
      const wrapper = mount(UiTransition, {
        props: { duration: 50 },
        slots: { default: '<div>Content</div>' },
      })
      expect(wrapper.html()).toContain('--ui-transition-duration: 50ms')
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
