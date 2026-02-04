<script setup lang="ts">
import type { EventResponseSingleAlert } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

const route = useRoute()

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Алерт',
})

const alertsComposable = useAlerts()
const { currentStatus, addComment, deleteComment, addLabel, deleteLabel, addAnnotation, deleteAnnotation, setStatus } = alertsComposable

const { data, status, refresh } = await useFetch<EventResponseSingleAlert>(
  `/api/v1/alerts/${route.params.id}`,
  { key: `alert-${route.params.id}` },
)

const alert = computed(() => data.value?.alert)
const isLoading = computed(() => status.value === 'pending' && !data.value)

const {
  actionLoading,
  handleAddComment,
  handleDeleteComment,
  handleAddLabel,
  handleDeleteLabel,
  handleSetStatus,
} = useEventDetailActions({
  entityRef: alert,
  actions: { addComment, deleteComment, addLabel, deleteLabel, setStatus },
  refresh,
})

const handleAddAnnotation = async (key: string, value: string) => {
  if (!alert.value) {
    return
  }
  const toast = useToast()
  const response = await addAnnotation(alert.value.id, key, value)
  if ('error' in response && response.error) {
    toast.error('Не удалось добавить аннотацию')
    return
  }
  await refresh()
  toast.success('Аннотация добавлена')
}

const handleDeleteAnnotation = async (key: string) => {
  if (!alert.value) {
    return
  }
  const toast = useToast()
  const response = await deleteAnnotation(alert.value.id, key)
  if ('error' in response && response.error) {
    toast.error('Не удалось удалить аннотацию')
    return
  }
  await refresh()
  toast.success('Аннотация удалена')
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

        <UiCard class="animate-slide-up mb-3">
          <EventKeyValueList
            :items="alert.annotations"
            title="Аннотации"
            empty-text="Нет аннотаций"
            mode="blocks"
            :loading="actionLoading"
            @add="handleAddAnnotation"
            @delete="handleDeleteAnnotation"
          />
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <EventKeyValueList
            :items="alert.labels"
            title="Лейблы"
            empty-text="Нет меток"
            mode="badges"
            :loading="actionLoading"
            deletable-only-with-creator
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
