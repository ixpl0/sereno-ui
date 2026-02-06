<script setup lang="ts">
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
const { alerts: allAlerts, currentStatus: alertCurrentStatus } = useAlerts()
const toast = useToast()

const incidentId = computed(() => route.params.id as string)

const { data: incidentData, status: fetchStatus, refresh } = useAsyncData(
  () => `incident-${incidentId.value}`,
  async () => {
    const { fetchIncident } = useIncidents()
    const result = await fetchIncident(incidentId.value)
    return result.data
  },
)

const incident = computed(() => incidentData.value?.incident)
const isLoading = computed(() => fetchStatus.value === 'pending' && !incidentData.value)

const {
  actionLoading,
  handleAddComment,
  handleDeleteComment,
  handleAddLabel,
  handleDeleteLabel,
  handleSetStatus,
} = useEventDetailActions({
  entityRef: incident,
  actions: { addComment, deleteComment, addLabel, deleteLabel, setStatus },
  refresh,
})

const availableAlerts = computed(() => {
  const linkedIds = new Set(incident.value?.alerts.map(a => a.id) ?? [])
  return allAlerts.value.filter(a => !linkedIds.has(a.id))
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
  const response = await addAlert(incident.value.id, selectedAlertId.value)
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
  const response = await removeAlert(incident.value.id, alertId)
  if ('error' in response && response.error) {
    toast.error('Не удалось удалить алерт')
    return
  }
  await refresh()
  toast.success('Алерт удалён')
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
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
                  aria-label="Удалить связанный алерт"
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
          <EventKeyValueList
            :items="incident.labels"
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
