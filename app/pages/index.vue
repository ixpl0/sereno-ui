<script setup lang="ts">
useSeoMeta({
  title: 'Главная',
  description: 'Sereno UI - современный интерфейс на Nuxt 4, DaisyUI и Pinia',
})

const router = useRouter()

const goToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center">
    <article class="text-center">
      <h1 class="text-4xl font-bold mb-4">
        Sereno UI
      </h1>
      <p class="text-base-content/70">
        Nuxt 4 + DaisyUI + Pinia + OpenAPI
      </p>
      <UiButton
        variant="primary"
        class="mt-6"
        @click="goToAuth"
      >
        Войти
      </UiButton>
    </article>
  </main>
</template>
