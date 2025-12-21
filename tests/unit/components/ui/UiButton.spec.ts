import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '~/components/ui/UiButton.vue'

describe('UiButton', () => {
  describe('rendering', () => {
    it('renders slot content', () => {
      const wrapper = mount(UiButton, {
        slots: { default: 'Click me' },
      })
      expect(wrapper.text()).toContain('Click me')
    })

    it('renders as button element', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.element.tagName).toBe('BUTTON')
    })
  })

  describe('variants', () => {
    it('applies primary variant by default', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.classes()).toContain('btn-primary')
    })

    it('applies secondary variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'secondary' } })
      expect(wrapper.classes()).toContain('btn-secondary')
    })

    it('applies accent variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'accent' } })
      expect(wrapper.classes()).toContain('btn-accent')
    })

    it('applies ghost variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'ghost' } })
      expect(wrapper.classes()).toContain('btn-ghost')
    })

    it('applies link variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'link' } })
      expect(wrapper.classes()).toContain('btn-link')
    })

    it('applies neutral variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'neutral' } })
      expect(wrapper.classes()).toContain('btn-neutral')
    })
  })

  describe('sizes', () => {
    it('applies md size by default (no class)', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.classes()).not.toContain('btn-xs')
      expect(wrapper.classes()).not.toContain('btn-sm')
      expect(wrapper.classes()).not.toContain('btn-lg')
    })

    it('applies xs size', () => {
      const wrapper = mount(UiButton, { props: { size: 'xs' } })
      expect(wrapper.classes()).toContain('btn-xs')
    })

    it('applies sm size', () => {
      const wrapper = mount(UiButton, { props: { size: 'sm' } })
      expect(wrapper.classes()).toContain('btn-sm')
    })

    it('applies lg size', () => {
      const wrapper = mount(UiButton, { props: { size: 'lg' } })
      expect(wrapper.classes()).toContain('btn-lg')
    })
  })

  describe('states', () => {
    it('is not disabled by default', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('applies disabled attribute', () => {
      const wrapper = mount(UiButton, { props: { disabled: true } })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('is disabled when loading', () => {
      const wrapper = mount(UiButton, { props: { loading: true } })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('shows spinner when loading', () => {
      const wrapper = mount(UiButton, { props: { loading: true } })
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('does not show spinner when not loading', () => {
      const wrapper = mount(UiButton, { props: { loading: false } })
      expect(wrapper.find('.loading-spinner').exists()).toBe(false)
    })

    it('sets aria-busy when loading', () => {
      const wrapper = mount(UiButton, { props: { loading: true } })
      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('modifiers', () => {
    it('applies outline class', () => {
      const wrapper = mount(UiButton, { props: { outline: true } })
      expect(wrapper.classes()).toContain('btn-outline')
    })

    it('applies block class', () => {
      const wrapper = mount(UiButton, { props: { block: true } })
      expect(wrapper.classes()).toContain('btn-block')
    })
  })

  describe('button type', () => {
    it('has type button by default', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.attributes('type')).toBe('button')
    })

    it('can be type submit', () => {
      const wrapper = mount(UiButton, { props: { type: 'submit' } })
      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('can be type reset', () => {
      const wrapper = mount(UiButton, { props: { type: 'reset' } })
      expect(wrapper.attributes('type')).toBe('reset')
    })
  })

  describe('accessibility', () => {
    it('sets aria-label when provided', () => {
      const wrapper = mount(UiButton, { props: { ariaLabel: 'Submit form' } })
      expect(wrapper.attributes('aria-label')).toBe('Submit form')
    })

    it('has no aria-label by default', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.attributes('aria-label')).toBeUndefined()
    })
  })

  describe('interactions', () => {
    it('emits click event', async () => {
      const wrapper = mount(UiButton)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click when disabled', async () => {
      const wrapper = mount(UiButton, { props: { disabled: true } })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})
