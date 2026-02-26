<script setup lang="ts">
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Алерты',
})

const { alerts, loading: isLoading, refresh, currentStatus, setStatus } = useAlerts()
const { viewMode, setViewMode } = useViewMode('alerts')
const { error: showError, success: showSuccess } = useToast()
const { getTenantName } = useTenants()

const statusFilter = ref<string>('all')

const enrichedAlerts = computed(() =>
  alerts.value.map(alert => ({
    ...alert,
    computedStatus: currentStatus(alert),
    activeLabels: alert.labels.filter(l => !l.deleted),
  })),
)

const filteredAlerts = computed(() => {
  if (statusFilter.value === 'all') {
    return enrichedAlerts.value
  }
  return enrichedAlerts.value.filter(alert => alert.computedStatus === statusFilter.value)
})

const handleRefresh = async () => {
  await refresh()
}

const handleStatusChange = async (alertId: string, newStatus: string) => {
  const response = await setStatus(alertId, newStatus as 'acknowledged' | 'resolved')

  if ('error' in response && response.error) {
    showError('Не удалось изменить статус')
    return
  }

  showSuccess(newStatus === 'acknowledged' ? 'Алерт подтверждён' : 'Алерт закрыт')
}

const goToAlertDetails = (alertId: string) => {
  navigateTo(`/alerts/${alertId}`)
}

const handleRowKeydown = (event: KeyboardEvent, alertId: string) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }
  event.preventDefault()
  goToAlertDetails(alertId)
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl font-semibold">
          Алерты
        </h1>
        <div class="flex w-full sm:w-auto flex-wrap items-center gap-3 sm:justify-end">
          <select
            v-model="statusFilter"
            class="select select-bordered select-sm w-44 shrink-0"
          >
            <option value="all">
              Все статусы
            </option>
            <option value="created">
              Создан
            </option>
            <option value="acknowledged">
              Подтверждён
            </option>
            <option value="resolved">
              Закрыт
            </option>
          </select>
          <UiViewModeToggle
            :model-value="viewMode"
            @update:model-value="setViewMode"
          />
          <UiButton
            variant="ghost"
            size="sm"
            aria-label="Обновить список алертов"
            @click="handleRefresh"
          >
            <Icon
              name="lucide:refresh-cw"
              class="w-4 h-4"
            />
          </UiButton>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="flex justify-center py-12"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>

      <UiEmptyState
        v-else-if="filteredAlerts.length === 0"
        icon="lucide:bell-off"
        title="Нет алертов"
      />

      <div
        v-else-if="viewMode === 'cards'"
        class="flex flex-col gap-3 animate-slide-up"
      >
        <EventAlertCard
          v-for="alert in filteredAlerts"
          :key="alert.id"
          :alert="alert"
          :current-status="alert.computedStatus"
          :tenant-name="getTenantName(alert.tenant.id)"
          @click="goToAlertDetails(alert.id)"
          @status-change="(newStatus) => handleStatusChange(alert.id, newStatus)"
        />
      </div>

      <UiCard
        v-else
        class="animate-slide-up"
      >
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Источник</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Команда</th>
                <th>Лейблы</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="alert in filteredAlerts"
                :key="alert.id"
                class="hover cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
                role="link"
                tabindex="0"
                :aria-label="`Открыть алерт ${alert.source}`"
                @click="goToAlertDetails(alert.id)"
                @keydown="(event) => handleRowKeydown(event, alert.id)"
              >
                <td>
                  <div class="font-medium">
                    {{ alert.source }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-base-content/70">
                    {{ formatDateTime(alert.time) }}
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getStatusColor(alert.computedStatus)"
                  >
                    {{ formatStatus(alert.computedStatus) }}
                  </span>
                </td>
                <td>
                  <div class="text-sm text-base-content/70">
                    {{ getTenantName(alert.tenant.id) }}
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="label in alert.activeLabels.slice(0, 3)"
                      :key="label.key"
                      class="badge badge-sm badge-ghost"
                    >
                      {{ label.key }}={{ label.value }}
                    </span>
                    <span
                      v-if="alert.activeLabels.length > 3"
                      class="badge badge-sm badge-ghost"
                    >
                      +{{ alert.activeLabels.length - 3 }}
                    </span>
                  </div>
                </td>
                <td>
                  <Icon
                    name="lucide:chevron-right"
                    class="w-4 h-4 text-base-content/40"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>
  </div>
</template>
