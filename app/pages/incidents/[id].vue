<script setup lang="ts">
import type { EventResponseSingleIncident, EventResponseAlertList } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

const route = useRoute()

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Инцидент',
})

const {
  currentStatus,
  addComment,
  deleteComment,
  addLabel,
  deleteLabel,
  setStatus,
  addAlert,
  removeAlert,
} = useIncidents()
const { currentStatus: alertCurrentStatus } = useAlerts()
const toast = useToast()

const { data, status, refresh } = await useFetch<EventResponseSingleIncident>(
  `/api/v1/incidents/${route.params.id}`,
  { key: `incident-${route.params.id}` },
)

const { data: alertsData } = await useFetch<EventResponseAlertList>('/api/v1/alerts')

const incident = computed(() => data.value?.incident)
const isLoading = computed(() => status.value === 'pending' && !data.value)
const actionLoading = ref(false)

const availableAlerts = computed(() => {
  const linkedIds = new Set(incident.value?.alerts.map(a => a.id) ?? [])
  return (alertsData.value?.alerts ?? []).filter(a => !linkedIds.has(a.id))
})

const isAddingAlert = ref(false)
const selectedAlertId = ref<string>('')

const startAddingAlert = () => {
  isAddingAlert.value = true
  selectedAlertId.value = ''
}

const cancelAddingAlert = () => {
  isAddingAlert.value = false
  selectedAlertId.value = ''
}

const handleAddAlert = async () => {
  if (!incident.value || !selectedAlertId.value) {
    return
  }
  actionLoading.value = true
  const response = await addAlert(incident.value.id, selectedAlertId.value)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить алерт')
    return
  }

  await refresh()
  toast.success('Алерт добавлен')
  cancelAddingAlert()
}

const handleRemoveAlert = async (alertId: string) => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await removeAlert(incident.value.id, alertId)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить алерт')
    return
  }

  await refresh()
  toast.success('Алерт удалён')
}

const handleAddComment = async (text: string) => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await addComment(incident.value.id, text)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить комментарий')
    return
  }

  await refresh()
  toast.success('Комментарий добавлен')
}

const handleDeleteComment = async (commentId: string) => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await deleteComment(incident.value.id, commentId)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить комментарий')
    return
  }

  await refresh()
  toast.success('Комментарий удалён')
}

const handleAddLabel = async (key: string, value: string) => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await addLabel(incident.value.id, key, value)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить метку')
    return
  }

  await refresh()
  toast.success('Метка добавлена')
}

const handleDeleteLabel = async (key: string) => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await deleteLabel(incident.value.id, key)
  actionLoading.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить метку')
    return
  }

  await refresh()
  toast.success('Метка удалена')
}

const handleSetStatus = async (newStatus: 'acknowledged' | 'resolved') => {
  if (!incident.value) {
    return
  }
  actionLoading.value = true
  const response = await setStatus(incident.value.id, newStatus)
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
    <div class="max-w-3xl mx-auto">
      <div class="mb-4">
        <NuxtLink
          to="/incidents"
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
        v-else-if="!incident"
        class="text-center py-12"
      >
        <Icon
          name="lucide:alert-circle"
          class="w-16 h-16 mx-auto text-base-content/20 mb-4"
        />
        <p class="text-base-content/60">
          Инцидент не найден
        </p>
      </div>

      <template v-else>
        <UiCard class="animate-slide-up mb-3">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-xl font-semibold mb-2">
                {{ incident.title }}
              </h1>
              <p
                v-if="incident.description"
                class="text-base-content/70 mb-2"
              >
                {{ incident.description }}
              </p>
              <div class="flex items-center gap-3 text-sm text-base-content/60">
                <span>{{ formatDateTime(incident.time) }}</span>
                <span>•</span>
                <span>{{ incident.tenant.id }}</span>
              </div>
            </div>
            <span
              class="badge badge-lg"
              :class="getStatusColor(currentStatus(incident))"
            >
              {{ formatStatus(currentStatus(incident)) }}
            </span>
          </div>

          <EventStatusActions
            :current-status="currentStatus(incident)"
            :loading="actionLoading"
            @set-status="handleSetStatus"
          />
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">
              Связанные алерты
            </h3>
            <UiButton
              v-if="!isAddingAlert && availableAlerts.length > 0"
              variant="ghost"
              size="sm"
              @click="startAddingAlert"
            >
              <Icon
                name="lucide:plus"
                class="w-4 h-4 mr-1"
              />
              Добавить
            </UiButton>
          </div>

          <div
            v-if="isAddingAlert"
            class="p-3 bg-base-200 rounded space-y-3 mb-4"
          >
            <select
              v-model="selectedAlertId"
              class="select select-bordered w-full"
            >
              <option
                value=""
                disabled
              >
                Выберите алерт
              </option>
              <option
                v-for="alertOption in availableAlerts"
                :key="alertOption.id"
                :value="alertOption.id"
              >
                {{ alertOption.source }} - {{ formatDateTime(alertOption.time) }}
              </option>
            </select>
            <div class="flex gap-2 justify-end">
              <UiButton
                variant="primary"
                size="sm"
                :disabled="!selectedAlertId"
                @click="handleAddAlert"
              >
                Добавить
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelAddingAlert"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <div
            v-if="incident.alerts.length === 0"
            class="text-center py-6 text-base-content/50"
          >
            Нет связанных алертов
          </div>

          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="linkedAlert in incident.alerts"
              :key="linkedAlert.id"
              class="flex items-center justify-between p-3 bg-base-200/50 rounded"
            >
              <div class="flex items-center gap-3">
                <Icon
                  name="lucide:bell"
                  class="w-4 h-4 text-base-content/60"
                />
                <div>
                  <div class="font-medium">
                    {{ linkedAlert.source }}
                  </div>
                  <div class="text-sm text-base-content/60">
                    {{ formatDateTime(linkedAlert.time) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="badge badge-sm"
                  :class="getStatusColor(alertCurrentStatus(linkedAlert))"
                >
                  {{ formatStatus(alertCurrentStatus(linkedAlert)) }}
                </span>
                <UiButton
                  variant="ghost"
                  size="sm"
                  @click="handleRemoveAlert(linkedAlert.id)"
                >
                  <Icon
                    name="lucide:x"
                    class="w-4 h-4"
                  />
                </UiButton>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <EventLabels
            :labels="incident.labels"
            :loading="actionLoading"
            @add="handleAddLabel"
            @delete="handleDeleteLabel"
          />
        </UiCard>

        <UiCard class="animate-slide-up mb-3">
          <EventStatusTimeline :statuses="incident.statuses" />
        </UiCard>

        <UiCard class="animate-slide-up">
          <EventComments
            :comments="incident.comments"
            :loading="actionLoading"
            @add="handleAddComment"
            @delete="handleDeleteComment"
          />
        </UiCard>
      </template>
    </div>
  </div>
</template>
