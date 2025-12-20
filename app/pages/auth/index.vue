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

  router.push('/dashboard')
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

const goBackToEmail = () => {
  step.value = 'email'
  code.value = ''
  clearError()
}

const oauthProviders: OAuthProviderConfig[] = [
  { id: 'yandex', name: 'Яндекс', icon: 'tabler:brand-yandex' },
  { id: 'vk', name: 'ВКонтакте', icon: 'simple-icons:vk' },
  { id: 'keycloak', name: 'Keycloak', icon: 'simple-icons:keycloak' },
]

const title = computed(() =>
  step.value === 'email' ? 'Вход в систему' : 'Введите код',
)
</script>

<template>
  <div class="w-full max-w-md">
    <UiCard
      :title="title"
      class="animate-slide-up"
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
        v-else
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
    </UiCard>
  </div>
</template>
