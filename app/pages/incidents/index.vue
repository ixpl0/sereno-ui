<script setup lang="ts">
import { client } from '~/api/client.gen'
import type { EventResponseIncidentList } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Инциденты',
})

const { currentStatus } = useIncidents()
const { viewMode, setViewMode } = useViewMode('incidents')
const { error: showError, success: showSuccess } = useToast()
const { getTenantName } = useTenantNames()

const { data, status, refresh } = await useFetch<EventResponseIncidentList>('/api/v1/incidents')

const incidents = computed(() => data.value?.incidents ?? [])
const isLoading = computed(() => status.value === 'pending' && !data.value)

const statusFilter = ref<string>('all')

const filteredIncidents = computed(() => {
  if (statusFilter.value === 'all') {
    return incidents.value
  }
  return incidents.value.filter(incident => currentStatus(incident) === statusFilter.value)
})

const handleRefresh = async () => {
  await refresh()
}

const handleStatusChange = async (incidentId: string, newStatus: string) => {
  const response = await client.post({
    url: '/incidents/{id}/status/set',
    path: { id: incidentId },
    body: { status: newStatus as 'acknowledged' | 'resolved' },
  })

  if (response.error) {
    showError('Не удалось изменить статус')
    return
  }

  showSuccess(newStatus === 'acknowledged' ? 'Инцидент подтверждён' : 'Инцидент закрыт')
  await refresh()
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">
          Инциденты
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
          <UiButton
            variant="primary"
            size="sm"
            @click="navigateTo('/incidents/create')"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4 mr-1"
            />
            Создать
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
        v-else-if="filteredIncidents.length === 0"
        icon="lucide:alert-triangle"
        title="Нет инцидентов"
      />

      <div
        v-else-if="viewMode === 'cards'"
        class="flex flex-col gap-3"
      >
        <EventIncidentCard
          v-for="incident in filteredIncidents"
          :key="incident.id"
          :incident="incident"
          :current-status="currentStatus(incident)"
          :tenant-name="getTenantName(incident.tenant.id)"
          @click="navigateTo(`/incidents/${incident.id}`)"
          @status-change="(newStatus) => handleStatusChange(incident.id, newStatus)"
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
                <th>Название</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Алерты</th>
                <th>Команда</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="incident in filteredIncidents"
                :key="incident.id"
                class="hover cursor-pointer"
                @click="navigateTo(`/incidents/${incident.id}`)"
              >
                <td>
                  <div class="font-medium">
                    {{ incident.title }}
                  </div>
                  <div
                    v-if="incident.description"
                    class="text-sm text-base-content/60 truncate max-w-xs"
                  >
                    {{ incident.description }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-base-content/70">
                    {{ formatDateTime(incident.time) }}
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getStatusColor(currentStatus(incident))"
                  >
                    {{ formatStatus(currentStatus(incident)) }}
                  </span>
                </td>
                <td>
                  <div class="badge badge-ghost">
                    {{ incident.alerts.length }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-base-content/70">
                    {{ getTenantName(incident.tenant.id) }}
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
