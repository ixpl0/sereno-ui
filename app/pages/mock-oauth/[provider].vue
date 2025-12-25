<script setup lang="ts">
import type { OAuthProvider } from '~/types/auth'
import {
  MOCK_OAUTH_PROVIDERS,
  MOCK_OAUTH_USERS,
  MOCK_OAUTH_PROVIDER_CONFIG,
  type MockOAuthScenario,
} from '~~/server/utils/mockAuth'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()

const provider = computed(() => route.params.provider as string)

const isValidProvider = computed(() =>
  MOCK_OAUTH_PROVIDERS.includes(provider.value as OAuthProvider),
)

const providerConfig = computed(() =>
  isValidProvider.value
    ? MOCK_OAUTH_PROVIDER_CONFIG[provider.value as OAuthProvider]
    : null,
)

const defaultUser = computed(() =>
  isValidProvider.value
    ? MOCK_OAUTH_USERS[provider.value as OAuthProvider][0]
    : null,
)

const isLoading = ref(false)
const selectedScenario = ref<MockOAuthScenario>('success')

const scenarios: ReadonlyArray<{ id: MockOAuthScenario, name: string, description: string, icon: string }> = [
  { id: 'success', name: 'Успешный вход', description: 'Авторизация пройдёт успешно', icon: 'heroicons:check-circle' },
  { id: 'cancel', name: 'Отмена', description: 'Пользователь отменил авторизацию', icon: 'heroicons:x-circle' },
  { id: 'error', name: 'Ошибка', description: 'Произошла ошибка на стороне провайдера', icon: 'heroicons:exclamation-triangle' },
  { id: 'timeout', name: 'Таймаут', description: 'Превышено время ожидания', icon: 'heroicons:clock' },
]

const handleCancel = () => {
  router.push('/auth')
}

const handleScenarioAction = async (scenario: MockOAuthScenario) => {
  const callbackPath = `/auth/callback/${provider.value}`

  if (scenario === 'success' && defaultUser.value) {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 800))
    const params = new URLSearchParams({
      scenario: 'success',
      user_id: defaultUser.value.id,
      email: defaultUser.value.email,
      name: defaultUser.value.name,
    })
    router.push(`${callbackPath}?${params.toString()}`)
    return
  }

  if (scenario === 'cancel') {
    router.push(`${callbackPath}?scenario=cancel&error=access_denied&error_description=User cancelled the authorization`)
    return
  }

  if (scenario === 'error') {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`${callbackPath}?scenario=error&error=server_error&error_description=Provider returned an error`)
    return
  }

  if (scenario === 'timeout') {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 3000))
    router.push(`${callbackPath}?scenario=timeout&error=timeout&error_description=Request timed out`)
  }
}

useSeoMeta({
  title: () => providerConfig.value ? `Вход через ${providerConfig.value.name}` : 'Mock OAuth',
})
</script>

<template>
  <UiTransition
    preset="scale-bounce"
    duration="slow"
    appear
  >
    <UiCard
      v-if="isValidProvider && providerConfig"
      class="w-full max-w-md"
    >
      <template #header>
        <div class="flex items-center justify-center gap-3 w-full">
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
      </template>

      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-8"
      >
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="mt-4 text-base-content/70">
          Авторизация...
        </p>
      </div>

      <template v-else>
        <div class="mb-6">
          <p class="text-sm text-base-content/70 text-center mb-4">
            Это тестовая страница OAuth провайдера.
            Выберите сценарий для входа.
          </p>

          <div class="tabs tabs-box mb-4">
            <button
              v-for="scenario in scenarios"
              :key="scenario.id"
              class="tab gap-1"
              :class="{ 'tab-active': selectedScenario === scenario.id }"
              @click="selectedScenario = scenario.id"
            >
              <Icon
                :name="scenario.icon"
                class="w-4 h-4"
                aria-hidden="true"
              />
              <span class="hidden sm:inline">{{ scenario.name }}</span>
            </button>
          </div>

          <p class="text-xs text-base-content/50 text-center">
            {{ scenarios.find(s => s.id === selectedScenario)?.description }}
          </p>
        </div>

        <UiButton
          variant="primary"
          block
          @click="handleScenarioAction(selectedScenario)"
        >
          <Icon
            :name="scenarios.find(s => s.id === selectedScenario)?.icon ?? 'heroicons:play'"
            class="w-5 h-5"
            aria-hidden="true"
          />
          Выполнить сценарий
        </UiButton>

        <div class="divider" />

        <UiButton
          variant="ghost"
          block
          @click="handleCancel"
        >
          Отмена
        </UiButton>
      </template>

      <template #footer>
        <p class="text-xs text-base-content/40 text-center w-full">
          Mock OAuth Provider • Только для разработки
        </p>
      </template>
    </UiCard>

    <UiCard
      v-else
      class="w-full max-w-md"
    >
      <template #header>
        <h1 class="text-xl font-semibold text-center w-full text-error">
          Неизвестный провайдер
        </h1>
      </template>

      <div class="text-center">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-16 h-16 text-error mx-auto mb-4"
          aria-hidden="true"
        />
        <p class="text-base-content/70 mb-4">
          Провайдер "{{ provider }}" не поддерживается.
        </p>
        <p class="text-sm text-base-content/50">
          Доступные провайдеры: {{ MOCK_OAUTH_PROVIDERS.join(', ') }}
        </p>
      </div>

      <template #footer>
        <UiButton
          variant="ghost"
          block
          @click="handleCancel"
        >
          Вернуться к авторизации
        </UiButton>
      </template>
    </UiCard>
  </UiTransition>
</template>
