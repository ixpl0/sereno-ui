<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Ошибка',
  description: 'Произошла ошибка',
})

const statusCode = computed(() => props.error.statusCode || 500)

const errorMessages: Record<number, { title: string, description: string }> = {
  404: {
    title: 'Страница не найдена',
    description: 'Запрашиваемая страница не существует или была удалена.',
  },
  403: {
    title: 'Доступ запрещён',
    description: 'У вас нет прав для просмотра этой страницы.',
  },
  500: {
    title: 'Внутренняя ошибка сервера',
    description: 'Произошла непредвиденная ошибка. Попробуйте позже.',
  },
}

const errorInfo = computed(() => {
  return errorMessages[statusCode.value] || {
    title: 'Произошла ошибка',
    description: props.error.message || 'Что-то пошло не так.',
  }
})

const handleGoHome = () => {
  clearError({ redirect: '/' })
}

const handleGoBack = () => {
  clearError()
  if (window.history.length > 1) {
    window.history.back()
  }
  else {
    navigateTo('/')
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <article class="text-center max-w-md">
      <div class="mb-8">
        <span class="text-8xl font-bold text-error">{{ statusCode }}</span>
      </div>

      <h1 class="text-2xl font-bold mb-4">
        {{ errorInfo.title }}
      </h1>

      <p class="text-base-content/70 mb-8">
        {{ errorInfo.description }}
      </p>

      <nav class="flex flex-col sm:flex-row gap-3 justify-center">
        <UiButton
          variant="primary"
          @click="handleGoHome"
        >
          На главную
        </UiButton>

        <UiButton
          variant="ghost"
          @click="handleGoBack"
        >
          Назад
        </UiButton>
      </nav>
    </article>
  </main>
</template>
