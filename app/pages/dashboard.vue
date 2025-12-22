<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Dashboard',
  description: 'Личный кабинет пользователя',
})

const { token, logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/auth')
}

const maskedToken = computed(() => {
  if (!token.value) {
    return ''
  }
  return `${token.value.slice(0, 20)}...`
})
</script>

<template>
  <main class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold">
          Dashboard
        </h1>
        <div class="flex gap-2">
          <UiButton
            variant="ghost"
            @click="router.push('/settings')"
          >
            Настройки
          </UiButton>
          <UiButton
            variant="ghost"
            aria-label="Выйти из аккаунта"
            @click="handleLogout"
          >
            Выйти
          </UiButton>
        </div>
      </header>

      <UiCard
        title="Добро пожаловать!"
        class="animate-slide-up"
      >
        <p class="text-base-content/70">
          Это защищённая страница. Вы авторизованы.
        </p>
        <div class="mt-4">
          <code class="bg-base-200/50 px-2 py-1 rounded">
            Token: {{ maskedToken }}
          </code>
        </div>
      </UiCard>
    </div>
  </main>
</template>
