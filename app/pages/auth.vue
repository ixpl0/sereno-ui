<script setup lang="ts">
import type { AuthStep, OAuthProvider, OAuthProviderConfig } from '~/types/auth'

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

  if ('data' in response && response.data) {
    const token = (response.data as { access_token?: string }).access_token
    if (token) {
      localStorage.setItem('auth_token', token)
    }
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

  localStorage.removeItem('auth_token')
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

  if ('data' in response && response.data) {
    const token = (response.data as { access_token?: string }).access_token
    if (token) {
      localStorage.setItem('auth_token', token)
    }
  }
}

const goBackToEmail = () => {
  step.value = 'email'
  code.value = ''
  clearError()
}

const goToHome = () => {
  router.push('/')
}

const oauthProviders: OAuthProviderConfig[] = [
  { id: 'yandex', name: 'Яндекс', icon: 'simple-icons:yandex' },
  { id: 'vk', name: 'ВКонтакте', icon: 'simple-icons:vk' },
  { id: 'keycloak', name: 'Keycloak', icon: 'simple-icons:keycloak' },
]
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center text-2xl mb-6">
          <template v-if="step === 'email'">
            Вход в систему
          </template>
          <template v-else-if="step === 'code'">
            Введите код
          </template>
          <template v-else>
            Вы авторизованы
          </template>
        </h2>

        <div
          v-if="error"
          class="alert alert-error mb-4"
        >
          <Icon
            name="heroicons:exclamation-circle"
            class="w-5 h-5"
          />
          <span>{{ error }}</span>
          <button
            class="btn btn-ghost btn-sm"
            @click="clearError"
          >
            <Icon
              name="heroicons:x-mark"
              class="w-4 h-4"
            />
          </button>
        </div>

        <template v-if="step === 'email'">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="input input-bordered w-full"
              :disabled="isLoading"
              @keyup.enter="handleRequestCode"
            >
          </div>

          <button
            class="btn btn-primary w-full mt-4"
            :disabled="isLoading || !email"
            @click="handleRequestCode"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-sm"
            />
            <template v-else>
              Получить код
            </template>
          </button>

          <div class="divider">
            или
          </div>

          <div class="flex flex-col gap-2">
            <button
              v-for="provider in oauthProviders"
              :key="provider.id"
              class="btn btn-outline"
              :disabled="isLoading"
              @click="handleOAuth(provider.id)"
            >
              <Icon
                :name="provider.icon"
                class="w-5 h-5"
              />
              {{ provider.name }}
            </button>
          </div>
        </template>

        <template v-else-if="step === 'code'">
          <p class="text-sm text-base-content/70 mb-4">
            Код отправлен на {{ email }}
          </p>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Код подтверждения</span>
            </label>
            <input
              v-model="code"
              type="text"
              placeholder="12345678"
              class="input input-bordered w-full text-center tracking-widest"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
            >
          </div>

          <button
            class="btn btn-primary w-full mt-4"
            :disabled="isLoading || !code"
            @click="handleLogin"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-sm"
            />
            <template v-else>
              Войти
            </template>
          </button>

          <button
            class="btn btn-ghost w-full mt-2"
            :disabled="isLoading"
            @click="goBackToEmail"
          >
            Назад
          </button>
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
            <button
              class="btn btn-primary"
              @click="goToHome"
            >
              На главную
            </button>

            <button
              class="btn btn-outline"
              :disabled="isLoading"
              @click="handleRefresh"
            >
              <span
                v-if="isLoading"
                class="loading loading-spinner loading-sm"
              />
              <template v-else>
                Обновить токен
              </template>
            </button>

            <button
              class="btn btn-ghost text-error"
              :disabled="isLoading"
              @click="handleLogout"
            >
              Выйти
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
