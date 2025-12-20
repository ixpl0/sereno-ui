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
  <main class="min-h-screen bg-base-200 p-8">
    <div class="max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">
          Dashboard
        </h1>
        <UiButton
          variant="ghost"
          aria-label="Выйти из аккаунта"
          @click="handleLogout"
        >
          Выйти
        </UiButton>
      </header>

      <article class="card bg-base-100 shadow-xl animate-slide-up">
        <div class="card-body">
          <h2 class="card-title">
            Добро пожаловать!
          </h2>
          <p class="text-base-content/70">
            Это защищённая страница. Вы авторизованы.
          </p>
          <div class="mt-4">
            <code class="bg-base-200 px-2 py-1 rounded">
              Token: {{ maskedToken }}
            </code>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
