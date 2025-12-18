<script setup lang="ts">
const router = useRouter()

const goToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">
        Sereno UI
      </h1>
      <p class="text-base-content/70">
        Nuxt 4 + DaisyUI + Pinia + OpenAPI
      </p>
      <button
        class="btn btn-primary mt-6"
        @click="goToAuth"
      >
        Войти
      </button>
    </div>
  </div>
</template>
