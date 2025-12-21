import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'

const config: StorybookConfig = {
  stories: [
    '../app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [],
  framework: '@storybook/vue3-vite',
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), vue()]
    return config
  },
}

export default config
