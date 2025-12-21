import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiLabel from '~/components/ui/UiLabel.vue'

describe('UiLabel', () => {
  describe('rendering', () => {
    it('renders as label element', () => {
      const wrapper = mount(UiLabel)
      expect(wrapper.element.tagName).toBe('LABEL')
    })

    it('renders slot content', () => {
      const wrapper = mount(UiLabel, {
        slots: { default: 'Email address' },
      })
      expect(wrapper.text()).toContain('Email address')
    })
  })

  describe('for attribute', () => {
    it('has no for attribute by default', () => {
      const wrapper = mount(UiLabel)
      expect(wrapper.attributes('for')).toBe('')
    })

    it('sets for attribute when provided', () => {
      const wrapper = mount(UiLabel, { props: { for: 'email-input' } })
      expect(wrapper.attributes('for')).toBe('email-input')
    })
  })

  describe('required indicator', () => {
    it('does not show asterisk by default', () => {
      const wrapper = mount(UiLabel, {
        slots: { default: 'Name' },
      })
      expect(wrapper.text()).not.toContain('*')
    })

    it('shows red asterisk when required', () => {
      const wrapper = mount(UiLabel, {
        props: { required: true },
        slots: { default: 'Name' },
      })
      expect(wrapper.text()).toContain('*')
      expect(wrapper.find('.text-error').exists()).toBe(true)
    })
  })

  describe('styling', () => {
    it('has label class', () => {
      const wrapper = mount(UiLabel)
      expect(wrapper.classes()).toContain('label')
    })
  })
})
