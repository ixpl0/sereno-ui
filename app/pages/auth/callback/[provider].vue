<script setup lang="ts">
import type { OAuthProvider } from '~/types/auth'
import { isApiError, extractApiError } from '~/utils/api'
import { MOCK_OAUTH_PROVIDERS, MOCK_OAUTH_PROVIDER_CONFIG } from '~/mocks/utils/constants'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const provider = computed(() => route.params.provider as string)

const isValidProvider = computed(() =>
  MOCK_OAUTH_PROVIDERS.includes(provider.value as OAuthProvider),
)

const providerConfig = computed(() =>
  isValidProvider.value
    ? MOCK_OAUTH_PROVIDER_CONFIG[provider.value as OAuthProvider]
    : null,
)

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref<string | null>(null)

const handleCallback = async () => {
  if (!isValidProvider.value) {
    status.value = 'error'
    errorMessage.value = `Неизвестный провайдер: ${provider.value}`
    return
  }

  const scenario = route.query.scenario as string | undefined
  const errorParam = route.query.error as string | undefined
  const errorDescription = route.query.error_description as string | undefined

  if (errorParam) {
    status.value = 'error'
    errorMessage.value = errorDescription ?? `Ошибка авторизации: ${errorParam}`
    return
  }

  if (scenario === 'cancel') {
    status.value = 'error'
    errorMessage.value = 'Авторизация отменена пользователем'
    return
  }

  if (scenario === 'error') {
    status.value = 'error'
    errorMessage.value = 'Ошибка на стороне провайдера'
    return
  }

  const callbackParams: Record<string, string> = {}
  const queryKeys = ['scenario', 'user_id', 'email', 'name'] as const

  queryKeys.forEach((key) => {
    const value = route.query[key]
    if (typeof value === 'string') {
      callbackParams[key] = value
    }
  })

  const response = await auth.handleOAuthCallback(
    provider.value as OAuthProvider,
    Object.keys(callbackParams).length > 0 ? callbackParams : undefined,
  )

  if (isApiError(response)) {
    status.value = 'error'
    errorMessage.value = extractApiError(response, 'Ошибка авторизации')
    return
  }

  status.value = 'success'

  await new Promise(resolve => setTimeout(resolve, 1500))
  router.push('/dashboard')
}

const goToAuth = () => {
  router.push('/auth')
}

useSeoMeta({
  title: () => providerConfig.value ? `Авторизация через ${providerConfig.value.name}` : 'OAuth Callback',
})

onMounted(() => {
  handleCallback()
})
</script>

<template>
  <UiTransition
    preset="scale-bounce"
    :duration="300"
    appear
  >
    <UiCard class="w-full max-w-md">
      <template #header>
        <div
          v-if="providerConfig"
          class="flex items-center justify-center gap-3 w-full"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: providerConfig.color + '20' }"
          >
            <Icon
              :name="providerConfig.icon"
              class="w-6 h-6"
              :style="{ color: providerConfig.color }"
              aria-hidden="true"
            />
          </div>
          <h1 class="text-xl font-semibold">
            {{ providerConfig.name }}
          </h1>
        </div>
        <h1
          v-else
          class="text-xl font-semibold text-center w-full"
        >
          OAuth Callback
        </h1>
      </template>

      <div
        v-if="status === 'loading'"
        class="flex flex-col items-center justify-center py-8"
      >
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="mt-4 text-base-content/70">
          Завершаем авторизацию...
        </p>
      </div>

      <div
        v-else-if="status === 'success'"
        class="flex flex-col items-center justify-center py-8"
      >
        <Icon
          name="heroicons:check-circle"
          class="w-16 h-16 text-success"
          aria-hidden="true"
        />
        <p class="mt-4 text-lg font-medium">
          Авторизация успешна!
        </p>
        <p class="mt-2 text-base-content/70">
          Переходим в dashboard...
        </p>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-8"
      >
        <Icon
          name="heroicons:exclamation-circle"
          class="w-16 h-16 text-error"
          aria-hidden="true"
        />
        <p class="mt-4 text-lg font-medium text-error">
          Ошибка авторизации
        </p>
        <p class="mt-2 text-base-content/70 text-center">
          {{ errorMessage }}
        </p>

        <UiButton
          variant="primary"
          class="mt-6"
          @click="goToAuth"
        >
          Назад
        </UiButton>
      </div>
    </UiCard>
  </UiTransition>
</template>
