import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiCard from './UiCard.vue'
import UiButton from './UiButton.vue'

const meta = {
  title: 'UI/UiCard',
  component: UiCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    bordered: { control: 'boolean' },
    hoverable: { control: 'boolean' },
  },
  args: {
    title: '',
    padding: 'md',
    bordered: false,
    hoverable: false,
  },
} satisfies Meta<typeof UiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { UiCard },
    setup: () => ({ args }),
    template: `
      <UiCard v-bind="args" class="max-w-md">
        <p>This is the card content. Cards are versatile containers for content.</p>
      </UiCard>
    `,
  }),
}

export const WithTitle: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <UiCard title="Card Title" class="max-w-md">
        <p>Card content goes here. The title appears in a header section.</p>
      </UiCard>
    `,
  }),
}

export const WithFooter: Story = {
  render: () => ({
    components: { UiCard, UiButton },
    template: `
      <UiCard title="Confirm Action" class="max-w-md">
        <p>Are you sure you want to proceed with this action?</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UiButton variant="ghost">Cancel</UiButton>
            <UiButton variant="primary">Confirm</UiButton>
          </div>
        </template>
      </UiCard>
    `,
  }),
}

export const Bordered: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <UiCard title="Bordered Card" bordered class="max-w-md">
        <p>This card has a border instead of just shadow.</p>
      </UiCard>
    `,
  }),
}

export const Hoverable: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <UiCard title="Hoverable Card" hoverable class="max-w-md">
        <p>Hover over this card to see the effect.</p>
      </UiCard>
    `,
  }),
}

export const CustomHeader: Story = {
  render: () => ({
    components: { UiCard, UiButton },
    template: `
      <UiCard class="max-w-md">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Custom Header</h3>
            <UiButton variant="ghost" size="sm">Action</UiButton>
          </div>
        </template>
        <p>Card with a custom header slot.</p>
      </UiCard>
    `,
  }),
}

export const NoPadding: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <UiCard padding="none" class="max-w-md">
        <img src="https://picsum.photos/400/200" alt="Placeholder" class="w-full rounded-t-2xl" />
        <div class="p-6">
          <h3 class="font-semibold mb-2">Image Card</h3>
          <p class="text-base-content/70">Card with no padding and an image.</p>
        </div>
      </UiCard>
    `,
  }),
}

export const AllPaddings: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <div class="flex flex-wrap gap-4">
        <UiCard padding="sm" title="Small Padding" class="w-48">
          <p class="text-sm">sm</p>
        </UiCard>
        <UiCard padding="md" title="Medium Padding" class="w-48">
          <p class="text-sm">md</p>
        </UiCard>
        <UiCard padding="lg" title="Large Padding" class="w-48">
          <p class="text-sm">lg</p>
        </UiCard>
      </div>
    `,
  }),
}
