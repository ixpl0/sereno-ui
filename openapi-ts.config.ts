import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './swagger.yaml',
  output: {
    path: './app/api',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    '@hey-api/sdk',
  ],
})
