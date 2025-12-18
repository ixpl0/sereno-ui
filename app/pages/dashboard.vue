<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { store, logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/auth')
}
</script>

<template>
  <div class="min-h-screen bg-base-200 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">
          Dashboard
        </h1>
        <button
          class="btn btn-ghost"
          @click="handleLogout"
        >
          Выйти
        </button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            Добро пожаловать!
          </h2>
          <p class="text-base-content/70">
            Это защищённая страница. Вы авторизованы.
          </p>
          <div class="mt-4">
            <code class="bg-base-200 px-2 py-1 rounded">
              Token: {{ store.token?.slice(0, 20) }}...
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
