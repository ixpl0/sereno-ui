<script setup lang="ts">
import type { AuthStep, OAuthProvider, OAuthProviderConfig } from '~/types/auth'
import { isApiError, extractApiError } from '~/utils/api'
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
const toast = useToast()
const config = useRuntimeConfig()

const step = ref<AuthStep>('email')
const email = ref('')
const code = ref('')
const isLoading = ref(false)
const pinInputRef = ref<{ focus: () => void } | null>(null)

watch(step, async (newStep) => {
  if (newStep === 'code') {
    await nextTick()
    pinInputRef.value?.focus()
  }
})

const handleRequestCode = async () => {
  if (!email.value) {
    toast.error('Введите email')
    return
  }

  if (!isValidEmail(email.value)) {
    toast.error('Некорректный email')
    return
  }

  isLoading.value = true

  const response = await auth.requestEmailCode(email.value)

  isLoading.value = false

  if (isApiError(response)) {
    toast.error(extractApiError(response, 'Ошибка отправки кода'))
    return
  }

  step.value = 'code'
}

const handleLogin = async () => {
  if (!code.value) {
    toast.error('Введите код')
    return
  }

  isLoading.value = true

  const response = await auth.loginWithEmail(email.value, code.value)

  isLoading.value = false

  if (isApiError(response)) {
    toast.error(extractApiError(response, 'Неверный код'))
    return
  }

  router.push('/dashboard')
}

const handleOAuth = async (provider: OAuthProvider) => {
  isLoading.value = true

  const response = await auth.getOAuthUrl(provider)

  isLoading.value = false

  if (response.error) {
    toast.error(`Ошибка авторизации через ${provider}`)
    return
  }

  if (response.data?.redirect_url) {
    const redirected = safeRedirect(response.data.redirect_url, config.public.allowedRedirectHosts)
    if (!redirected) {
      toast.error('Недопустимый URL для редиректа')
    }
  }
}

const goBackToEmail = () => {
  step.value = 'email'
  code.value = ''
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
          autofocus
          :disabled="isLoading"
          @keyup.enter="handleRequestCode"
        />

        <UiButton
          variant="primary"
          block
          class="mt-4"
          :disabled="!email || isLoading"
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

        <UiPinInput
          ref="pinInputRef"
          v-model="code"
          label="Код подтверждения"
          :length="8"
          :group-size="4"
          :disabled="isLoading"
          class="mb-2"
          @complete="handleLogin"
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
