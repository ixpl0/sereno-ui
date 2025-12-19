import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiModal from './UiModal.vue'
import UiButton from './UiButton.vue'
import UiInput from './UiInput.vue'

const meta = {
  title: 'UI/UiModal',
  component: UiModal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    title: { control: 'text' },
    closable: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
  },
  args: {
    modelValue: false,
    size: 'md',
    title: 'Modal Title',
    closable: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
} satisfies Meta<typeof UiModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    modelValue: false,
  },
  render: args => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Modal</UiButton>
        <UiModal v-model="isOpen" v-bind="args">
          <p>This is the modal content. Click outside or press Escape to close.</p>
        </UiModal>
      </div>
    `,
  }),
}

export const WithFooter: Story = {
  args: {
    modelValue: false,
  },
  render: args => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Modal with Footer</UiButton>
        <UiModal v-model="isOpen" v-bind="args" title="Confirm Action">
          <p>Are you sure you want to proceed with this action?</p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UiButton variant="ghost" @click="isOpen = false">Cancel</UiButton>
              <UiButton variant="primary" @click="isOpen = false">Confirm</UiButton>
            </div>
          </template>
        </UiModal>
      </div>
    `,
  }),
}

export const WithForm: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton, UiInput },
    setup: () => {
      const isOpen = ref(false)
      const email = ref('')
      const password = ref('')
      return { isOpen, email, password }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Form Modal</UiButton>
        <UiModal v-model="isOpen" title="Login" size="sm">
          <div class="flex flex-col gap-4">
            <UiInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
            />
            <UiInput
              v-model="password"
              type="password"
              label="Password"
              placeholder="Enter password"
              required
            />
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UiButton variant="ghost" @click="isOpen = false">Cancel</UiButton>
              <UiButton variant="primary" @click="isOpen = false">Login</UiButton>
            </div>
          </template>
        </UiModal>
      </div>
    `,
  }),
}

export const Small: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Small Modal</UiButton>
        <UiModal v-model="isOpen" title="Small Modal" size="sm">
          <p>This is a small modal.</p>
        </UiModal>
      </div>
    `,
  }),
}

export const Large: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Large Modal</UiButton>
        <UiModal v-model="isOpen" title="Large Modal" size="lg">
          <p>This is a large modal with more space for content.</p>
          <p class="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </UiModal>
      </div>
    `,
  }),
}

export const ExtraLarge: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Extra Large Modal</UiButton>
        <UiModal v-model="isOpen" title="Extra Large Modal" size="xl">
          <p>This is an extra large modal.</p>
          <p class="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        </UiModal>
      </div>
    `,
  }),
}

export const NotClosable: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Not Closable Modal</UiButton>
        <UiModal
          v-model="isOpen"
          title="Mandatory Action"
          :closable="false"
          :close-on-backdrop="false"
          :close-on-escape="false"
        >
          <p>You must complete this action to continue.</p>
          <template #footer>
            <UiButton variant="primary" block @click="isOpen = false">
              I understand
            </UiButton>
          </template>
        </UiModal>
      </div>
    `,
  }),
}

export const NoTitle: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const isOpen = ref(false)
      return { isOpen }
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Modal without Title</UiButton>
        <UiModal v-model="isOpen">
          <div class="text-center py-4">
            <p class="text-2xl mb-2">🎉</p>
            <p class="text-lg font-semibold">Success!</p>
            <p class="text-base-content/70 mt-2">Your action was completed successfully.</p>
          </div>
        </UiModal>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  args: {
    modelValue: false,
  },
  render: () => ({
    components: { UiModal, UiButton },
    setup: () => {
      const openModal = ref<'sm' | 'md' | 'lg' | 'xl' | null>(null)
      return { openModal }
    },
    template: `
      <div class="flex gap-4">
        <UiButton @click="openModal = 'sm'">Small</UiButton>
        <UiButton @click="openModal = 'md'">Medium</UiButton>
        <UiButton @click="openModal = 'lg'">Large</UiButton>
        <UiButton @click="openModal = 'xl'">XL</UiButton>

        <UiModal v-model="openModal" :model-value="openModal === 'sm'" @update:model-value="openModal = null" title="Small" size="sm">
          <p>Small modal content</p>
        </UiModal>
        <UiModal :model-value="openModal === 'md'" @update:model-value="openModal = null" title="Medium" size="md">
          <p>Medium modal content</p>
        </UiModal>
        <UiModal :model-value="openModal === 'lg'" @update:model-value="openModal = null" title="Large" size="lg">
          <p>Large modal content</p>
        </UiModal>
        <UiModal :model-value="openModal === 'xl'" @update:model-value="openModal = null" title="Extra Large" size="xl">
          <p>Extra large modal content</p>
        </UiModal>
      </div>
    `,
  }),
}
