<script setup lang="ts">
import type { UserResponseSessions } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'settings',
  title: 'Сессии',
})

useSeoMeta({
  title: 'Активные сессии',
  description: 'Управление активными сессиями',
})

const { data: sessionsData, status: sessionsStatus, refresh: refreshSessions } = await useFetch<UserResponseSessions>('/api/v1/user/sessions')

const sessionsLoading = computed(() => sessionsStatus.value === 'pending' && !sessionsData.value)

const currentSession = computed(() =>
  sessionsData.value?.sessions?.find(s => s.current === true),
)

const otherSessions = computed(() =>
  sessionsData.value?.sessions?.filter(s => s.current !== true) ?? [],
)

const { closeAllSessions } = useSessions()
const toast = useToast()

const handleCloseAllSessions = async () => {
  await closeAllSessions()
  await refreshSessions()
  toast.success('Все сессии закрыты')
}

const formatDevice = (device: string | undefined): string => {
  if (!device) {
    return 'Неизвестное устройство'
  }
  if (device.includes('Windows')) {
    return 'Windows'
  }
  if (device.includes('Mac')) {
    return 'macOS'
  }
  if (device.includes('iPhone')) {
    return 'iPhone'
  }
  if (device.includes('Android')) {
    return 'Android'
  }
  if (device.includes('Linux')) {
    return 'Linux'
  }
  return 'Браузер'
}

const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) {
    return ''
  }
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <UiCard class="animate-slide-up">
      <div
        v-if="sessionsLoading"
        class="flex justify-center py-8"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>
      <div
        v-else
        class="space-y-4"
      >
        <div
          v-if="currentSession"
          class="flex items-center justify-between p-3 bg-success/10 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div class="badge badge-success">
              Текущая
            </div>
            <div>
              <div class="font-medium">
                {{ formatDevice(currentSession.device) }}
              </div>
              <div class="text-sm text-base-content/60">
                {{ formatDate(currentSession.since) }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-for="session in otherSessions"
          :key="session.id"
          class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
        >
          <div>
            <div class="font-medium">
              {{ formatDevice(session.device) }}
            </div>
            <div class="text-sm text-base-content/60">
              {{ formatDate(session.since) }}
            </div>
          </div>
        </div>

        <div
          v-if="otherSessions.length === 0 && !currentSession"
          class="text-center text-base-content/60 py-4"
        >
          Нет активных сессий
        </div>

        <div
          v-if="otherSessions.length > 0"
          class="pt-4"
        >
          <UiButton
            variant="error"
            class="w-full"
            @click="handleCloseAllSessions"
          >
            Завершить все другие сессии
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
