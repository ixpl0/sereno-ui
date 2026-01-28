<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'Дашборд',
})

useSeoMeta({
  title: 'Дашборд',
  description: 'Личный кабинет пользователя',
})

const { token } = useAuth()

const maskedToken = computed(() => {
  if (!token.value) {
    return ''
  }
  return `${token.value.slice(0, 20)}...`
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <UiCard
        title="Добро пожаловать!"
        class="animate-slide-up"
      >
        <p class="text-base-content/70">
          Это защищённая страница. Вы авторизованы.
        </p>
        <ClientOnly>
          <div class="mt-4">
            <code class="bg-base-200/50 px-2 py-1 rounded">
              Token: {{ maskedToken }}
            </code>
          </div>
        </ClientOnly>
      </UiCard>
    </div>
  </div>
</template>
