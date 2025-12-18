import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiButton from './UiButton.vue'

const meta = {
  title: 'UI/UiButton',
  component: UiButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost', 'link', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    outline: { control: 'boolean' },
    block: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    outline: false,
    block: false,
    loading: false,
    disabled: false,
  },
  render: args => ({
    components: { UiButton },
    setup: () => ({ args }),
    template: '<UiButton v-bind="args">Button</UiButton>',
  }),
} satisfies Meta<typeof UiButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Accent: Story = {
  args: {
    variant: 'accent',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
}

export const Neutral: Story = {
  args: {
    variant: 'neutral',
  },
}

export const Outline: Story = {
  args: {
    variant: 'primary',
    outline: true,
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
}

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
  },
}

export const Block: Story = {
  args: {
    variant: 'primary',
    block: true,
  },
}

export const AllVariants: Story = {
  render: () => ({
    components: { UiButton },
    template: `
      <div class="flex flex-wrap gap-4">
        <UiButton variant="primary">Primary</UiButton>
        <UiButton variant="secondary">Secondary</UiButton>
        <UiButton variant="accent">Accent</UiButton>
        <UiButton variant="ghost">Ghost</UiButton>
        <UiButton variant="link">Link</UiButton>
        <UiButton variant="neutral">Neutral</UiButton>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { UiButton },
    template: `
      <div class="flex items-center gap-4">
        <UiButton size="xs">Extra Small</UiButton>
        <UiButton size="sm">Small</UiButton>
        <UiButton size="md">Medium</UiButton>
        <UiButton size="lg">Large</UiButton>
      </div>
    `,
  }),
}
