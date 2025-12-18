<script setup lang="ts">
import type { AuthStep, OAuthProvider, OAuthProviderConfig } from '~/types/auth'

definePageMeta({
  middleware: 'guest',
})

const auth = useAuth()
const router = useRouter()

const step = ref<AuthStep>('email')
const email = ref('')
const code = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const clearError = () => {
  error.value = null
}

const handleRequestCode = async () => {
  if (!email.value) {
    error.value = 'Введите email'
    return
  }

  isLoading.value = true
  clearError()

  const response = await auth.requestEmailCode(email.value)

  isLoading.value = false

  if ('error' in response && response.error) {
    error.value = typeof response.error === 'object' && 'error' in response.error
      ? String(response.error.error)
      : 'Ошибка отправки кода'
    return
  }

  step.value = 'code'
}

const handleLogin = async () => {
  if (!code.value) {
    error.value = 'Введите код'
    return
  }

  isLoading.value = true
  clearError()

  const response = await auth.loginWithEmail(email.value, code.value)

  isLoading.value = false

  if ('error' in response && response.error) {
    error.value = typeof response.error === 'object' && 'error' in response.error
      ? String(response.error.error)
      : 'Неверный код'
    return
  }

  step.value = 'success'
}

const handleOAuth = async (provider: OAuthProvider) => {
  isLoading.value = true
  clearError()

  const response = await auth.getOAuthUrl(provider)

  isLoading.value = false

  if ('error' in response && response.error) {
    error.value = `Ошибка авторизации через ${provider}`
    return
  }

  if ('data' in response && response.data) {
    const redirectUrl = (response.data as { redirect_url?: string }).redirect_url
    if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }
}

const handleLogout = async () => {
  isLoading.value = true

  await auth.logout()

  isLoading.value = false
  step.value = 'email'
  email.value = ''
  code.value = ''
}

const handleRefresh = async () => {
  isLoading.value = true
  clearError()

  const response = await auth.refresh()

  isLoading.value = false

  if ('error' in response && response.error) {
    error.value = 'Ошибка обновления токена'
    return
  }
}

const goBackToEmail = () => {
  step.value = 'email'
  code.value = ''
  clearError()
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const oauthProviders: OAuthProviderConfig[] = [
  { id: 'yandex', name: 'Яндекс', icon: 'tabler:brand-yandex' },
  { id: 'vk', name: 'ВКонтакте', icon: 'simple-icons:vk' },
  { id: 'keycloak', name: 'Keycloak', icon: 'simple-icons:keycloak' },
]

const title = computed(() => {
  if (step.value === 'email') {
    return 'Вход в систему'
  }
  if (step.value === 'code') {
    return 'Введите код'
  }
  return 'Вы авторизованы'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 via-base-200 to-base-300 relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-[60rem] -right-[60rem] w-[85rem] h-[85rem] bg-primary/40 rounded-full blur-[180px]" />
      <div class="absolute -bottom-[60rem] -left-[60rem] w-[85rem] h-[85rem] bg-secondary/40 rounded-full blur-[180px]" />
      <div class="absolute top-1/2 -left-[40rem] w-[60rem] h-[60rem] bg-accent/25 rounded-full blur-[180px]" />
      <div class="absolute -bottom-[40rem] right-1/4 w-[50rem] h-[50rem] bg-info/25 rounded-full blur-[150px]" />
      <div class="absolute inset-0 opacity-20 noise-overlay" />
    </div>

    <UiTransition
      preset="scale-bounce"
      :duration="300"
      appear
    >
      <UiCard
        :title="title"
        class="w-full max-w-md relative z-10"
      >
        <template #header>
          <h2 class="text-2xl font-semibold text-center w-full">
            {{ title }}
          </h2>
        </template>

        <div
          v-if="error"
          class="alert alert-error mb-4"
        >
          <Icon
            name="heroicons:exclamation-circle"
            class="w-5 h-5"
          />
          <span>{{ error }}</span>
          <UiButton
            variant="ghost"
            size="sm"
            @click="clearError"
          >
            <Icon
              name="heroicons:x-mark"
              class="w-4 h-4"
            />
          </UiButton>
        </div>

        <template v-if="step === 'email'">
          <UiInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            :disabled="isLoading"
            @keyup.enter="handleRequestCode"
          />

          <UiButton
            variant="primary"
            block
            class="mt-4"
            :disabled="!email"
            :loading="isLoading"
            @click="handleRequestCode"
          >
            Получить код
          </UiButton>

          <div class="divider">
            или
          </div>

          <div class="flex flex-col gap-2">
            <UiButton
              v-for="provider in oauthProviders"
              :key="provider.id"
              variant="ghost"
              class="border border-base-300 hover:border-primary"
              :disabled="isLoading"
              @click="handleOAuth(provider.id)"
            >
              <Icon
                :name="provider.icon"
                class="w-5 h-5"
              />
              {{ provider.name }}
            </UiButton>
          </div>
        </template>

        <template v-else-if="step === 'code'">
          <p class="text-sm text-base-content/70 mb-4">
            Код отправлен на {{ email }}
          </p>

          <UiInput
            v-model="code"
            type="text"
            label="Код подтверждения"
            placeholder="12345678"
            :disabled="isLoading"
            @keyup.enter="handleLogin"
          />

          <UiButton
            variant="primary"
            block
            class="mt-4"
            :disabled="!code"
            :loading="isLoading"
            @click="handleLogin"
          >
            Войти
          </UiButton>

          <UiButton
            variant="ghost"
            block
            class="mt-2"
            :disabled="isLoading"
            @click="goBackToEmail"
          >
            Назад
          </UiButton>
        </template>

        <template v-else>
          <div class="text-center">
            <Icon
              name="heroicons:check-circle"
              class="w-16 h-16 text-success mx-auto mb-4"
            />
            <p class="text-base-content/70 mb-6">
              Вы успешно вошли в систему
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <UiButton
              variant="primary"
              @click="goToDashboard"
            >
              В dashboard
            </UiButton>

            <UiButton
              variant="neutral"
              outline
              :loading="isLoading"
              @click="handleRefresh"
            >
              Обновить токен
            </UiButton>

            <UiButton
              variant="ghost"
              class="text-error"
              :disabled="isLoading"
              @click="handleLogout"
            >
              Выйти
            </UiButton>
          </div>
        </template>
      </UiCard>
    </UiTransition>
  </div>
</template>
