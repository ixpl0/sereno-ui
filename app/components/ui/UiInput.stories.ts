import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiInput from './UiInput.vue'

const meta = {
  title: 'UI/UiInput',
  component: UiInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
    },
    variant: {
      control: 'select',
      options: ['bordered', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    type: 'text',
    variant: 'bordered',
    size: 'md',
    state: 'default',
    label: '',
    placeholder: 'Enter text...',
    hint: '',
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof UiInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    type: 'email',
  },
}

export const WithHint: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    hint: 'Minimum 8 characters',
  },
}

export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
  },
}

export const ErrorState: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    state: 'error',
    hint: 'Invalid email format',
  },
}

export const SuccessState: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    state: 'success',
    hint: 'Email is available',
  },
}

export const WarningState: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    state: 'warning',
    hint: 'Weak password',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    placeholder: 'Ghost variant',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
}

export const AllStates: Story = {
  render: () => ({
    components: { UiInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <UiInput label="Default" placeholder="Default state" />
        <UiInput label="Error" placeholder="Error state" state="error" hint="Something went wrong" />
        <UiInput label="Success" placeholder="Success state" state="success" hint="Looks good!" />
        <UiInput label="Warning" placeholder="Warning state" state="warning" hint="Check this" />
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { UiInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <UiInput size="xs" placeholder="Extra small" />
        <UiInput size="sm" placeholder="Small" />
        <UiInput size="md" placeholder="Medium" />
        <UiInput size="lg" placeholder="Large" />
      </div>
    `,
  }),
}

export const Interactive: Story = {
  render: () => ({
    components: { UiInput },
    setup: () => {
      const value = ref('')
      return { value }
    },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <UiInput
          v-model="value"
          label="Interactive input"
          placeholder="Type something..."
          hint="Value will appear below"
        />
        <p class="text-sm text-base-content/70">Current value: {{ value || '(empty)' }}</p>
      </div>
    `,
  }),
}
