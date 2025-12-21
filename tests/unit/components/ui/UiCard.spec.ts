import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiCard from '~/components/ui/UiCard.vue'

describe('UiCard', () => {
  describe('rendering', () => {
    it('renders slot content', () => {
      const wrapper = mount(UiCard, {
        slots: { default: 'Card content' },
      })
      expect(wrapper.text()).toContain('Card content')
    })

    it('renders as div element', () => {
      const wrapper = mount(UiCard)
      expect(wrapper.element.tagName).toBe('DIV')
    })
  })

  describe('title', () => {
    it('does not show header when no title', () => {
      const wrapper = mount(UiCard, {
        slots: { default: 'Content' },
      })
      expect(wrapper.find('h3').exists()).toBe(false)
    })

    it('shows title in header', () => {
      const wrapper = mount(UiCard, {
        props: { title: 'Card Title' },
      })
      expect(wrapper.find('h3').text()).toBe('Card Title')
    })
  })

  describe('slots', () => {
    it('renders header slot', () => {
      const wrapper = mount(UiCard, {
        slots: { header: '<div class="custom-header">Custom Header</div>' },
      })
      expect(wrapper.find('.custom-header').exists()).toBe(true)
    })

    it('renders footer slot', () => {
      const wrapper = mount(UiCard, {
        slots: { footer: '<div class="custom-footer">Footer content</div>' },
      })
      expect(wrapper.find('.custom-footer').exists()).toBe(true)
    })

    it('does not render footer container when no footer slot', () => {
      const wrapper = mount(UiCard, {
        slots: { default: 'Content' },
      })
      const divs = wrapper.findAll('div')
      const footerDiv = divs.find(d => d.classes().includes('py-4') && d.text() === '')
      expect(footerDiv).toBeUndefined()
    })
  })

  describe('padding', () => {
    it('applies md padding by default', () => {
      const wrapper = mount(UiCard)
      const contentDiv = wrapper.findAll('div').find(d => d.classes().includes('p-6'))
      expect(contentDiv).toBeDefined()
    })

    it('applies no padding with none', () => {
      const wrapper = mount(UiCard, { props: { padding: 'none' } })
      const contentDivs = wrapper.findAll('div')
      const hasNoPadding = contentDivs.some(d =>
        !d.classes().includes('p-4')
        && !d.classes().includes('p-6')
        && !d.classes().includes('p-8'),
      )
      expect(hasNoPadding).toBe(true)
    })

    it('applies sm padding', () => {
      const wrapper = mount(UiCard, { props: { padding: 'sm' } })
      const contentDiv = wrapper.findAll('div').find(d => d.classes().includes('p-4'))
      expect(contentDiv).toBeDefined()
    })

    it('applies lg padding', () => {
      const wrapper = mount(UiCard, { props: { padding: 'lg' } })
      const contentDiv = wrapper.findAll('div').find(d => d.classes().includes('p-8'))
      expect(contentDiv).toBeDefined()
    })
  })

  describe('modifiers', () => {
    it('applies border when bordered', () => {
      const wrapper = mount(UiCard, { props: { bordered: true } })
      expect(wrapper.classes()).toContain('border')
    })

    it('does not apply border by default', () => {
      const wrapper = mount(UiCard)
      expect(wrapper.classes()).not.toContain('border')
    })

    it('applies hover effects when hoverable', () => {
      const wrapper = mount(UiCard, { props: { hoverable: true } })
      expect(wrapper.classes().some(c => c.includes('hover:'))).toBe(true)
    })
  })
})
