<script setup lang="ts">
import { client } from '~/api/client.gen'
import type { EventResponseAlertList } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Алерты',
})

const { currentStatus } = useAlerts()
const { viewMode, setViewMode } = useViewMode('alerts')
const { showToast } = useToast()

const { data, status, refresh } = await useFetch<EventResponseAlertList>('/api/v1/alerts')

const alerts = computed(() => data.value?.alerts ?? [])
const isLoading = computed(() => status.value === 'pending' && !data.value)

const statusFilter = ref<string>('all')

const filteredAlerts = computed(() => {
  if (statusFilter.value === 'all') {
    return alerts.value
  }
  return alerts.value.filter(alert => currentStatus(alert) === statusFilter.value)
})

const getAlertLabelsPreview = (alert: typeof alerts.value[0]) => {
  const activeLabels = alert.labels.filter(l => !l.deleted)
  return activeLabels.slice(0, 3)
}

const handleRefresh = async () => {
  await refresh()
}

const handleStatusChange = async (alertId: string, newStatus: string) => {
  const response = await client.post({
    url: '/alerts/{id}/status/set',
    path: { id: alertId },
    body: { status: newStatus as 'acknowledged' | 'resolved' },
  })

  if (response.error) {
    showToast('Не удалось изменить статус', 'error')
    return
  }

  showToast(newStatus === 'acknowledged' ? 'Алерт подтверждён' : 'Алерт закрыт', 'success')
  await refresh()
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">
          Алерты
        </h1>
        <div class="flex items-center gap-3">
          <select
            v-model="statusFilter"
            class="select select-bordered select-sm"
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

      <div
        v-else-if="filteredAlerts.length === 0"
        class="text-center py-12"
      >
        <Icon
          name="lucide:bell-off"
          class="w-16 h-16 mx-auto text-base-content/20 mb-4"
        />
        <p class="text-base-content/60">
          Нет алертов
        </p>
      </div>

      <div
        v-else-if="viewMode === 'cards'"
        class="flex flex-col gap-6 max-w-4xl mx-auto"
      >
        <EventAlertCard
          v-for="alert in filteredAlerts"
          :key="alert.id"
          :alert="alert"
          :current-status="currentStatus(alert)"
          @click="navigateTo(`/alerts/${alert.id}`)"
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
                <th>Метки</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="alert in filteredAlerts"
                :key="alert.id"
                class="hover cursor-pointer"
                @click="navigateTo(`/alerts/${alert.id}`)"
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
                    :class="getStatusColor(currentStatus(alert))"
                  >
                    {{ formatStatus(currentStatus(alert)) }}
                  </span>
                </td>
                <td>
                  <div class="text-sm text-base-content/70">
                    {{ alert.tenant.id }}
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="label in getAlertLabelsPreview(alert)"
                      :key="label.key"
                      class="badge badge-sm badge-ghost"
                    >
                      {{ label.key }}={{ label.value }}
                    </span>
                    <span
                      v-if="alert.labels.filter(l => !l.deleted).length > 3"
                      class="badge badge-sm badge-ghost"
                    >
                      +{{ alert.labels.filter(l => !l.deleted).length - 3 }}
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
