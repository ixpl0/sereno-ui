import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiToast from './UiToast.vue'
import UiButton from './UiButton.vue'
import { useToast } from '~/composables/useToast'

const meta = {
  title: 'UI/UiToast',
  component: UiToast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UiToast>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { success, error, warning, info } = useToast()
      return { success, error, warning, info }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <div class="flex flex-wrap gap-4">
          <UiButton variant="primary" @click="success('Операция выполнена успешно!')">
            Success
          </UiButton>
          <UiButton variant="secondary" @click="error('Произошла ошибка!')">
            Error
          </UiButton>
          <UiButton variant="accent" @click="warning('Внимание! Проверьте данные.')">
            Warning
          </UiButton>
          <UiButton variant="neutral" @click="info('Информационное сообщение')">
            Info
          </UiButton>
        </div>
      </div>
    `,
  }),
}

export const SuccessToast: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { success } = useToast()
      return { success }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <UiButton variant="primary" @click="success('Данные сохранены!')">
          Показать успех
        </UiButton>
      </div>
    `,
  }),
}

export const ErrorToast: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { error } = useToast()
      return { error }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <UiButton variant="secondary" @click="error('Не удалось загрузить данные')">
          Показать ошибку
        </UiButton>
      </div>
    `,
  }),
}

export const WarningToast: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { warning } = useToast()
      return { warning }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <UiButton variant="accent" @click="warning('Сессия истекает через 5 минут')">
          Показать предупреждение
        </UiButton>
      </div>
    `,
  }),
}

export const InfoToast: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { info } = useToast()
      return { info }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <UiButton variant="neutral" @click="info('Новое обновление доступно')">
          Показать инфо
        </UiButton>
      </div>
    `,
  }),
}

export const MultipleToasts: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { success, error, warning, info } = useToast()
      const showAll = () => {
        success('Успех!')
        setTimeout(() => error('Ошибка!'), 200)
        setTimeout(() => warning('Предупреждение!'), 400)
        setTimeout(() => info('Информация!'), 600)
      }
      return { showAll }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <UiButton variant="primary" @click="showAll">
          Показать все типы
        </UiButton>
      </div>
    `,
  }),
}

export const CustomTimeout: Story = {
  render: () => ({
    components: { UiToast, UiButton },
    setup: () => {
      const { success, info } = useToast()
      return { success, info }
    },
    template: `
      <div class="p-8">
        <UiToast />
        <div class="flex gap-4">
          <UiButton variant="primary" @click="success('Исчезнет через 2 секунды', 2000)">
            Быстрый (2с)
          </UiButton>
          <UiButton variant="neutral" @click="info('Исчезнет через 10 секунд', 10000)">
            Долгий (10с)
          </UiButton>
        </div>
      </div>
    `,
  }),
}
