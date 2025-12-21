import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiPinInput from './UiPinInput.vue'

const meta = {
  title: 'UI/UiPinInput',
  component: UiPinInput,
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 12 },
    },
    groupSize: {
      control: { type: 'number', min: 2, max: 6 },
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    disabled: { control: 'boolean' },
    autofocus: { control: 'boolean' },
    label: { control: 'text' },
    required: { control: 'boolean' },
  },
  args: {
    length: 8,
    groupSize: 4,
    state: 'default',
    disabled: false,
    autofocus: false,
    label: '',
    required: false,
  },
} satisfies Meta<typeof UiPinInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const WithLabel: Story = {
  args: {
    label: 'Код подтверждения',
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const WithLabelRequired: Story = {
  args: {
    label: 'Код подтверждения',
    required: true,
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const SixDigits: Story = {
  args: {
    length: 6,
    groupSize: 3,
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const FourDigits: Story = {
  args: {
    length: 4,
    groupSize: 4,
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const ErrorState: Story = {
  args: {
    state: 'error',
    label: 'Неверный код',
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('1234')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const SuccessState: Story = {
  args: {
    state: 'success',
    label: 'Код подтверждён',
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('12345678')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('1234')
      return { args, code }
    },
    template: '<UiPinInput v-bind="args" v-model="code" />',
  }),
}

export const WithCompleteHandler: Story = {
  render: () => ({
    components: { UiPinInput },
    setup: () => {
      const code = ref('')
      const completed = ref(false)
      const handleComplete = (value: string) => {
        completed.value = true
        console.log('Code completed:', value)
      }
      return { code, completed, handleComplete }
    },
    template: `
      <div>
        <UiPinInput
          v-model="code"
          label="Введите код"
          @complete="handleComplete"
        />
        <p v-if="completed" class="mt-4 text-success">Код введён полностью!</p>
      </div>
    `,
  }),
}

export const AllStates: Story = {
  render: () => ({
    components: { UiPinInput },
    setup: () => {
      const defaultCode = ref('')
      const errorCode = ref('1234')
      const successCode = ref('12345678')
      return { defaultCode, errorCode, successCode }
    },
    template: `
      <div class="space-y-6">
        <UiPinInput v-model="defaultCode" label="По умолчанию" state="default" />
        <UiPinInput v-model="errorCode" label="Ошибка" state="error" />
        <UiPinInput v-model="successCode" label="Успех" state="success" />
      </div>
    `,
  }),
}
