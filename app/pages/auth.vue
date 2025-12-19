<script setup lang="ts">
import type { AuthStep, OAuthProvider, OAuthProviderConfig } from '~/types/auth'
import { isApiError, extractApiError, getApiData } from '~/utils/api'
import { safeRedirect } from '~/utils/url'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useSeoMeta({
  title: 'Вход в систему',
  description: 'Авторизуйтесь для доступа к личному кабинету',
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

  if (isApiError(response)) {
    error.value = extractApiError(response, 'Ошибка отправки кода')
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

  if (isApiError(response)) {
    error.value = extractApiError(response, 'Неверный код')
    return
  }

  step.value = 'success'
}

const handleOAuth = async (provider: OAuthProvider) => {
  isLoading.value = true
  clearError()

  const response = await auth.getOAuthUrl(provider)

  isLoading.value = false

  if (isApiError(response)) {
    error.value = `Ошибка авторизации через ${provider}`
    return
  }

  const data = getApiData(response)
  if (data?.redirect_url) {
    const redirected = safeRedirect(data.redirect_url)
    if (!redirected) {
      error.value = 'Недопустимый URL для редиректа'
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
  clearError()
}

const handleRefresh = async () => {
  isLoading.value = true
  clearError()

  const response = await auth.refresh()

  isLoading.value = false

  if (isApiError(response)) {
    error.value = 'Ошибка обновления токена'
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
  <UiTransition
    preset="scale-bounce"
    :duration="300"
    appear
  >
    <UiCard
      :title="title"
      class="w-full max-w-md"
    >
      <template #header>
        <h1 class="text-2xl font-semibold text-center w-full">
          {{ title }}
        </h1>
      </template>

      <div
        v-if="error"
        role="alert"
        aria-live="polite"
        class="alert alert-error mb-4"
      >
        <Icon
          name="heroicons:exclamation-circle"
          class="w-5 h-5"
          aria-hidden="true"
        />
        <span>{{ error }}</span>
        <UiButton
          variant="ghost"
          size="sm"
          aria-label="Закрыть сообщение об ошибке"
          @click="clearError"
        >
          <Icon
            name="heroicons:x-mark"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </UiButton>
      </div>

      <section
        v-if="step === 'email'"
        aria-labelledby="auth-email-heading"
      >
        <h2
          id="auth-email-heading"
          class="sr-only"
        >
          Форма входа по email
        </h2>
        <UiInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="admin@example.ru"
          autocomplete="email"
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

        <nav
          class="flex flex-col gap-2"
          aria-label="Войти через социальные сети"
        >
          <UiButton
            v-for="provider in oauthProviders"
            :key="provider.id"
            variant="ghost"
            :disabled="isLoading"
            :aria-label="`Войти через ${provider.name}`"
            @click="handleOAuth(provider.id)"
          >
            <Icon
              :name="provider.icon"
              class="w-5 h-5"
              aria-hidden="true"
            />
            {{ provider.name }}
          </UiButton>
        </nav>
      </section>

      <section
        v-else-if="step === 'code'"
        aria-labelledby="auth-code-heading"
      >
        <h2
          id="auth-code-heading"
          class="sr-only"
        >
          Ввод кода подтверждения
        </h2>
        <p class="text-sm text-base-content/70 mb-4">
          Код отправлен на {{ email }}
        </p>

        <UiInput
          v-model="code"
          type="text"
          label="Код подтверждения"
          placeholder="12345678"
          autocomplete="one-time-code"
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
      </section>

      <section
        v-else
        aria-labelledby="auth-success-heading"
      >
        <h2
          id="auth-success-heading"
          class="sr-only"
        >
          Успешная авторизация
        </h2>
        <div class="text-center">
          <Icon
            name="heroicons:check-circle"
            class="w-16 h-16 text-success mx-auto mb-4"
            aria-hidden="true"
          />
          <p class="text-base-content/70 mb-6">
            Вы успешно вошли в систему
          </p>
        </div>

        <nav
          class="flex flex-col gap-2"
          aria-label="Действия после входа"
        >
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
        </nav>
      </section>
    </UiCard>
  </UiTransition>
</template>
