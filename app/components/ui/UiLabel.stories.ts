import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiLabel from './UiLabel.vue'

const meta = {
  title: 'UI/UiLabel',
  component: UiLabel,
  tags: ['autodocs'],
  argTypes: {
    for: { control: 'text' },
    required: { control: 'boolean' },
  },
  args: {
    for: '',
    required: false,
  },
  render: args => ({
    components: { UiLabel },
    setup: () => ({ args }),
    template: '<UiLabel v-bind="args">Метка поля</UiLabel>',
  }),
} satisfies Meta<typeof UiLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Required: Story = {
  args: {
    required: true,
  },
}

export const WithFor: Story = {
  args: {
    for: 'email-input',
  },
  render: args => ({
    components: { UiLabel },
    setup: () => ({ args }),
    template: `
      <div>
        <UiLabel v-bind="args">Email</UiLabel>
        <input id="email-input" type="email" class="input input-bordered w-full" placeholder="example@mail.com" />
      </div>
    `,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { UiLabel },
    template: `
      <div class="space-y-4">
        <div>
          <UiLabel>Обычная метка</UiLabel>
          <input type="text" class="input input-bordered w-full" />
        </div>
        <div>
          <UiLabel required>Обязательное поле</UiLabel>
          <input type="text" class="input input-bordered w-full" />
        </div>
      </div>
    `,
  }),
}
