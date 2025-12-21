import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UiTransition from './UiTransition.vue'
import UiButton from './UiButton.vue'
import UiCard from './UiCard.vue'

const meta = {
  title: 'UI/UiTransition',
  component: UiTransition,
  tags: ['autodocs'],
  argTypes: {
    preset: {
      control: 'select',
      options: ['fade', 'scale', 'scale-bounce', 'slide-up', 'slide-down', 'slide-left', 'slide-right'],
    },
    duration: {
      control: 'select',
      options: ['fast', 'normal', 'slow', 'slower'],
    },
    appear: { control: 'boolean' },
    mode: {
      control: 'select',
      options: ['default', 'in-out', 'out-in'],
    },
  },
  args: {
    preset: 'fade',
    duration: 'normal',
    appear: false,
    mode: 'default',
  },
} satisfies Meta<typeof UiTransition>

export default meta
type Story = StoryObj<typeof meta>

export const Fade: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="fade">
          <UiCard v-if="show" title="Fade" class="max-w-sm">
            <p>This card fades in and out</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const Scale: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="scale">
          <UiCard v-if="show" title="Scale" class="max-w-sm">
            <p>This card scales in and out</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const ScaleBounce: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="scale-bounce" duration="normal">
          <UiCard v-if="show" title="Scale Bounce" class="max-w-sm">
            <p>This card has a bouncy scale animation</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const SlideUp: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="slide-up">
          <UiCard v-if="show" title="Slide Up" class="max-w-sm">
            <p>This card slides up when entering</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const SlideDown: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="slide-down">
          <UiCard v-if="show" title="Slide Down" class="max-w-sm">
            <p>This card slides down when entering</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const SlideLeft: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="slide-left">
          <UiCard v-if="show" title="Slide Left" class="max-w-sm">
            <p>This card slides from right to left</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const SlideRight: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle</UiButton>
        <UiTransition preset="slide-right">
          <UiCard v-if="show" title="Slide Right" class="max-w-sm">
            <p>This card slides from left to right</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const WithAppear: Story = {
  render: () => ({
    components: { UiTransition, UiCard },
    template: `
      <UiTransition preset="scale-bounce" duration="slow" appear>
        <UiCard title="Appears on Mount" class="max-w-sm">
          <p>This card animates when the component first mounts</p>
        </UiCard>
      </UiTransition>
    `,
  }),
}

export const CustomDuration: Story = {
  render: () => ({
    components: { UiTransition, UiButton, UiCard },
    setup: () => {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <UiButton @click="show = !show" class="mb-4">Toggle (slow)</UiButton>
        <UiTransition preset="scale" duration="slower">
          <UiCard v-if="show" title="Slow Animation" class="max-w-sm">
            <p>This card has a slower (500ms) animation</p>
          </UiCard>
        </UiTransition>
      </div>
    `,
  }),
}

export const AllPresets: Story = {
  render: () => ({
    components: { UiTransition, UiButton },
    setup: () => {
      const states = ref({
        'fade': true,
        'scale': true,
        'scale-bounce': true,
        'slide-up': true,
        'slide-down': true,
        'slide-left': true,
        'slide-right': true,
      })
      const toggle = (key: string) => {
        states.value[key as keyof typeof states.value] = !states.value[key as keyof typeof states.value]
      }
      return { states, toggle }
    },
    template: `
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(show, preset) in states" :key="preset">
          <UiButton size="sm" @click="toggle(preset)" class="mb-2">{{ preset }}</UiButton>
          <UiTransition :preset="preset">
            <div v-if="show" class="p-4 bg-base-200 rounded-lg">
              {{ preset }}
            </div>
          </UiTransition>
        </div>
      </div>
    `,
  }),
}
