import type { Preview } from '@storybook/vue3-vite'
import '../app/assets/css/main.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'oklch(0.25 0.02 260)' },
        { name: 'light', value: 'oklch(0.96 0.01 240)' },
      ],
    },
  },
  decorators: [
    (story, context) => ({
      components: { story },
      template: `<div data-theme="${context.globals.theme || 'dark'}" class="p-4"><story /></div>`,
    }),
  ],
  globalTypes: {
    theme: {
      description: 'DaisyUI theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
}

export default preview
