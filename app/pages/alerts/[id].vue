<script setup lang="ts">
import type { EventResponseSingleAlert } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

const route = useRoute()

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Алерт',
})

const { currentStatus, addComment, deleteComment, addLabel, deleteLabel, setStatus } = useAlerts()
const toast = useToast()

const { data, status, refresh } = await useFetch<EventResponseSingleAlert>(
  `/api/v1/alerts/${route.params.id}`,
  { key: `alert-${route.params.id}` },
)

const alert = computed(() => data.value?.alert)
const isLoading = computed(() => status.value === 'pending' && !data.value)
const actionLoading = ref(false)

const activeAnnotations = computed(() =>
  alert.value?.annotations.filter(a => !a.deleted) ?? [],
)

const handleAddComment = async (text: string) => {
  if (!alert.value) {
    return
  }
  actionLoading.value = true
  const response = await addComment(alert.value.id, text)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить комментарий')
    return
  }

  await refresh()
  toast.success('Комментарий добавлен')
}

const handleDeleteComment = async (commentId: string) => {
  if (!alert.value) {
    return
  }
  actionLoading.value = true
  const response = await deleteComment(alert.value.id, commentId)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить комментарий')
    return
  }

  await refresh()
  toast.success('Комментарий удалён')
}

const handleAddLabel = async (key: string, value: string) => {
  if (!alert.value) {
    return
  }
  actionLoading.value = true
  const response = await addLabel(alert.value.id, key, value)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить метку')
    return
  }

  await refresh()
  toast.success('Метка добавлена')
}

const handleDeleteLabel = async (key: string) => {
  if (!alert.value) {
    return
  }
  actionLoading.value = true
  const response = await deleteLabel(alert.value.id, key)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить метку')
    return
  }

  await refresh()
  toast.success('Метка удалена')
}

const handleSetStatus = async (newStatus: 'acknowledged' | 'resolved') => {
  if (!alert.value) {
    return
  }
  actionLoading.value = true
  const response = await setStatus(alert.value.id, newStatus)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось изменить статус')
    return
  }

  await refresh()
  toast.success('Статус изменён')
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="mb-4">
        <NuxtLink
          to="/alerts"
          class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-base-content transition-colors"
        >
          <Icon
            name="lucide:arrow-left"
            class="w-4 h-4"
          />
          Назад к списку
        </NuxtLink>
      </div>

      <div
        v-if="isLoading"
        class="flex justify-center py-12"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div
        v-else-if="!alert"
        class="text-center py-12"
      >
        <Icon
          name="lucide:alert-circle"
          class="w-16 h-16 mx-auto text-base-content/20 mb-4"
        />
        <p class="text-base-content/60">
          Алерт не найден
        </p>
      </div>

      <template v-else>
        <UiCard class="animate-slide-up mb-3">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-xl font-semibold mb-2">
                {{ alert.source }}
              </h1>
              <div class="flex items-center gap-3 text-sm text-base-content/60">
                <span>{{ formatDateTime(alert.time) }}</span>
                <span>•</span>
                <span>{{ alert.tenant.id }}</span>
              </div>
            </div>
            <span
              class="badge badge-lg"
              :class="getStatusColor(currentStatus(alert))"
            >
              {{ formatStatus(currentStatus(alert)) }}
            </span>
          </div>

          <EventStatusActions
            :current-status="currentStatus(alert)"
            :loading="actionLoading"
            @set-status="handleSetStatus"
          />
        </UiCard>

        <UiCard
          v-if="activeAnnotations.length > 0"
          class="animate-slide-up mb-3"
        >
          <h3 class="text-lg font-medium mb-4">
            Аннотации
          </h3>
          <div class="space-y-3">
            <div
              v-for="annotation in activeAnnotations"
              :key="annotation.key"
              class="p-3 bg-base-200/50 rounded"
            >
              <div class="font-medium text-sm text-base-content/70 mb-1">
                {{ annotation.key }}
              </div>
              <div class="text-sm">
                {{ annotation.value }}
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <EventLabels
            :labels="alert.labels"
            :loading="actionLoading"
            @add="handleAddLabel"
            @delete="handleDeleteLabel"
          />
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <EventStatusTimeline :statuses="alert.statuses" />
        </UiCard>

        <UiCard class="animate-slide-up">
          <EventComments
            :comments="alert.comments"
            :loading="actionLoading"
            @add="handleAddComment"
            @delete="handleDeleteComment"
          />
        </UiCard>
      </template>
    </div>
  </div>
</template>
