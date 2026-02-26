<script setup lang="ts">
import { client } from '~/api/client.gen'
import {
  getAlertsStats,
  getIncidents,
  getSchedulesByIdShifts,
  getTenants,
} from '~/api/sdk.gen'
import type {
  EventResponseAlertsStats,
  EventResponseIncident,
  EventResponseIncidentList,
  TenantResponseSchedule,
  TenantResponseScheduleList,
  TenantResponseTenant,
} from '~/api/types.gen'
import { getCurrentEventStatus } from '~/utils/event'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  title: 'Дашборд',
})

useSeoMeta({
  title: 'Дашборд',
  description: 'Сводка по дежурствам, инцидентам и алертам',
})

interface DashboardSchedule {
  id: string
  name: string
  onCallMembers: string[]
}

interface DashboardTenantOnCall {
  id: string
  name: string
  schedules: DashboardSchedule[]
}

interface DashboardIncidentRow {
  id: string
  title: string
  time: number
  tenantId: string
  latestStatus: string
}

interface StatsPoint {
  timestamp: number
  value: number
}

interface DashboardData {
  onCallTenants: DashboardTenantOnCall[]
  createdIncidents: EventResponseIncident[]
  acknowledgedIncidents: EventResponseIncident[]
  alertsStats: EventResponseAlertsStats | null
  tenantNames: Record<string, string>
}

const getSeriesPoints = (series: { timestamp: number[], value: number[] } | undefined): StatsPoint[] => {
  if (!series) {
    return []
  }

  const length = Math.min(series.timestamp.length, series.value.length)
  return Array.from({ length }, (_, index) => ({
    timestamp: series.timestamp[index] ?? 0,
    value: series.value[index] ?? 0,
  }))
}

const fetchIncidentsByStatus = async (status: 'created' | 'acknowledged'): Promise<EventResponseIncident[]> => {
  const result = await client.get<{ 200: EventResponseIncidentList }>({
    url: '/incidents',
    query: { status },
  })

  if (!result.error && result.data) {
    return result.data.incidents
  }

  const fallback = await getIncidents()
  if (fallback.error || !fallback.data) {
    return []
  }

  return fallback.data.incidents.filter(incident => getCurrentEventStatus(incident) === status)
}

const fetchSchedulesByTenant = async (tenantId: string): Promise<ReadonlyArray<TenantResponseSchedule>> => {
  const result = await client.get<{ 200: TenantResponseScheduleList }>({
    url: '/tenants/{id}/schedules',
    path: { id: tenantId },
  })

  if (result.error || !result.data) {
    return []
  }

  return result.data.schedules
}

const fetchOnCallForSchedule = async (scheduleId: string): Promise<string[]> => {
  const result = await getSchedulesByIdShifts({
    path: { id: scheduleId },
    query: { timestamp: Math.floor(Date.now() / 1000) },
  })

  if (result.error || !result.data) {
    return []
  }

  return [...new Set(result.data.shifts.map(shift => shift.member))]
}

const { data, status: fetchStatus, refresh } = useAsyncData<DashboardData>(
  'dashboard-data',
  async () => {
    const tenantsResult = await getTenants()
    const tenants: ReadonlyArray<TenantResponseTenant>
      = tenantsResult.error || !tenantsResult.data ? [] : tenantsResult.data.tenants

    const tenantNames = tenants.reduce<Record<string, string>>((acc, tenant) => {
      acc[tenant.id] = tenant.name
      return acc
    }, {})

    const onCallTenants = await Promise.all(
      tenants.map(async (tenant) => {
        const schedules = await fetchSchedulesByTenant(tenant.id)
        const schedulesWithOnCall = await Promise.all(
          schedules.map(async schedule => ({
            id: schedule.id,
            name: schedule.name,
            onCallMembers: await fetchOnCallForSchedule(schedule.id),
          })),
        )

        return {
          id: tenant.id,
          name: tenant.name,
          schedules: schedulesWithOnCall,
        }
      }),
    )

    const [createdIncidents, acknowledgedIncidents, alertsStatsResult] = await Promise.all([
      fetchIncidentsByStatus('created'),
      fetchIncidentsByStatus('acknowledged'),
      getAlertsStats(),
    ])

    return {
      onCallTenants,
      createdIncidents,
      acknowledgedIncidents,
      alertsStats: alertsStatsResult.error || !alertsStatsResult.data ? null : alertsStatsResult.data,
      tenantNames,
    }
  },
  {
    default: () => ({
      onCallTenants: [],
      createdIncidents: [],
      acknowledgedIncidents: [],
      alertsStats: null,
      tenantNames: {},
    }),
  },
)

const loading = computed(() => fetchStatus.value === 'pending')

const toIncidentRows = (incidents: ReadonlyArray<EventResponseIncident>): DashboardIncidentRow[] =>
  incidents.map(incident => ({
    id: incident.id,
    title: incident.title,
    time: incident.time,
    tenantId: incident.tenant.id,
    latestStatus: getCurrentEventStatus(incident),
  }))

const createdIncidentRows = computed(() => toIncidentRows(data.value.createdIncidents))
const acknowledgedIncidentRows = computed(() => toIncidentRows(data.value.acknowledgedIncidents))

const alertsSeries = computed(() => ({
  created: getSeriesPoints(data.value.alertsStats?.created),
  acknowledged: getSeriesPoints(data.value.alertsStats?.acknowledged),
  resolved: getSeriesPoints(data.value.alertsStats?.resolved),
}))

const hasChartData = computed(() => {
  const series = alertsSeries.value
  return series.created.length > 0 || series.acknowledged.length > 0 || series.resolved.length > 0
})

const latestValue = (points: ReadonlyArray<StatsPoint>): number =>
  points[points.length - 1]?.value ?? 0

const latestCreated = computed(() => latestValue(alertsSeries.value.created))
const latestAcknowledged = computed(() => latestValue(alertsSeries.value.acknowledged))
const latestResolved = computed(() => latestValue(alertsSeries.value.resolved))

const getTenantName = (tenantId: string): string =>
  data.value.tenantNames[tenantId] ?? tenantId
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-6xl mx-auto space-y-4">
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else>
        <UiCard
          title="Дежурные"
          class="animate-slide-up"
        >
          <div
            v-if="data.onCallTenants.length === 0"
            class="text-base-content/60"
          >
            Нет доступных команд
          </div>
          <div
            v-else
            class="space-y-5"
          >
            <div
              v-for="tenant in data.onCallTenants"
              :key="tenant.id"
              class="space-y-2"
            >
              <h3 class="font-semibold">
                {{ tenant.name }}
              </h3>
              <div
                v-if="tenant.schedules.length === 0"
                class="text-sm text-base-content/60"
              >
                Нет расписаний
              </div>
              <div
                v-for="schedule in tenant.schedules"
                :key="schedule.id"
                class="rounded-md px-3 py-2 border"
                :class="schedule.onCallMembers.length === 0
                  ? 'bg-error/10 border-error/40'
                  : 'bg-base-200/40 border-transparent'"
              >
                <div class="font-medium flex items-center gap-2">
                  {{ schedule.name }}
                  <span
                    v-if="schedule.onCallMembers.length === 0"
                    class="badge badge-sm badge-error"
                  >
                    Не назначен
                  </span>
                </div>
                <div class="text-sm text-base-content/70">
                  On Call:
                  <span v-if="schedule.onCallMembers.length > 0">
                    {{ schedule.onCallMembers.join(', ') }}
                  </span>
                  <span
                    v-else
                    class="text-error font-medium"
                  >
                    не назначен
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UiCard>

        <div class="grid gap-4 lg:grid-cols-2">
          <UiCard class="animate-slide-up bg-error/5">
            <div class="flex items-start gap-4">
              <div class="text-error text-6xl leading-none font-semibold">
                {{ createdIncidentRows.length }}
              </div>
              <div>
                <h3 class="font-semibold text-lg">
                  Создано
                </h3>
                <p class="text-sm text-base-content/70">
                  Инциденты со статусом created
                </p>
              </div>
            </div>

            <div class="mt-4 overflow-auto max-h-72">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Time</th>
                    <th>Title</th>
                    <th>Last status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="incident in createdIncidentRows"
                    :key="incident.id"
                  >
                    <td>{{ getTenantName(incident.tenantId) }}</td>
                    <td>{{ formatDateTime(incident.time) }}</td>
                    <td>{{ incident.title }}</td>
                    <td>
                      <span
                        class="badge badge-sm"
                        :class="getStatusColor(incident.latestStatus)"
                      >
                        {{ formatStatus(incident.latestStatus) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-if="createdIncidentRows.length === 0"
                class="text-sm text-base-content/60 py-2"
              >
                Нет инцидентов
              </div>
            </div>
          </UiCard>

          <UiCard class="animate-slide-up bg-warning/10">
            <div class="flex items-start gap-4">
              <div class="text-warning text-6xl leading-none font-semibold">
                {{ acknowledgedIncidentRows.length }}
              </div>
              <div>
                <h3 class="font-semibold text-lg">
                  Подтверждено
                </h3>
                <p class="text-sm text-base-content/70">
                  Инциденты со статусом acknowledged
                </p>
              </div>
            </div>

            <div class="mt-4 overflow-auto max-h-72">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Time</th>
                    <th>Title</th>
                    <th>Last status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="incident in acknowledgedIncidentRows"
                    :key="incident.id"
                  >
                    <td>{{ getTenantName(incident.tenantId) }}</td>
                    <td>{{ formatDateTime(incident.time) }}</td>
                    <td>{{ incident.title }}</td>
                    <td>
                      <span
                        class="badge badge-sm"
                        :class="getStatusColor(incident.latestStatus)"
                      >
                        {{ formatStatus(incident.latestStatus) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-if="acknowledgedIncidentRows.length === 0"
                class="text-sm text-base-content/60 py-2"
              >
                Нет инцидентов
              </div>
            </div>
          </UiCard>
        </div>

        <UiCard
          title="График алертов за сутки"
          class="animate-slide-up"
        >
          <div
            v-if="!hasChartData"
            class="text-base-content/60"
          >
            Нет данных по алертам
          </div>
          <div v-else>
            <ClientOnly>
              <DashboardAlertsStackedChart
                :created="alertsSeries.created"
                :acknowledged="alertsSeries.acknowledged"
                :resolved="alertsSeries.resolved"
              />
              <template #fallback>
                <div class="h-72 flex items-center justify-center">
                  <span class="loading loading-spinner loading-md" />
                </div>
              </template>
            </ClientOnly>

            <div class="mt-4 flex flex-wrap gap-5 text-sm">
              <span class="text-error">
                Создан: {{ latestCreated }}
              </span>
              <span class="text-warning">
                Подтвержден: {{ latestAcknowledged }}
              </span>
              <span class="text-success">
                Закрыт: {{ latestResolved }}
              </span>
            </div>
          </div>
        </UiCard>

        <div class="flex justify-end">
          <UiButton
            variant="ghost"
            size="sm"
            @click="refresh"
          >
            <Icon
              name="lucide:refresh-cw"
              class="w-4 h-4 mr-1"
            />
            Обновить
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>
