import { client } from '~/api/client.gen'
import {
  postTenantsByIdSchedulesCreate,
  postTenantsByIdSchedulesDelete,
  postSchedulesByIdRotationCreate,
  postSchedulesByIdRotationDelete,
  postSchedulesByIdOverrideCreate,
  postSchedulesByIdOverrideDelete,
} from '~/api/sdk.gen'
import type {
  TenantResponseSchedule,
  TenantResponseScheduleList,
  TenantRequestNewSchedule,
  TenantRequestRotation,
  TenantRequestOverride,
} from '~/api/types.gen'

type SchedulesCache = Record<string, ReadonlyArray<TenantResponseSchedule>>

export const useSchedules = (tenantId: Ref<string>) => {
  const schedulesCache = useState<SchedulesCache>('schedules-cache', () => ({}))
  const schedules = computed({
    get: () => schedulesCache.value[tenantId.value] ?? [],
    set: (value: ReadonlyArray<TenantResponseSchedule>) => {
      schedulesCache.value = { ...schedulesCache.value, [tenantId.value]: value }
    },
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedules = async () => {
    if (!tenantId.value) {
      return null
    }

    loading.value = true
    error.value = null

    const response = await client.get<{ 200: TenantResponseScheduleList }>({
      url: '/tenants/{id}/schedules',
      path: { id: tenantId.value },
    })

    loading.value = false

    if (response.data?.schedules) {
      schedules.value = response.data.schedules
    }
    else {
      error.value = 'Failed to fetch schedules'
    }

    return response
  }

  const createSchedule = async (schedule: TenantRequestNewSchedule) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdSchedulesCreate({
      path: { id: tenantId.value },
      body: schedule,
    })

    loading.value = false

    if (response.data?.schedule) {
      schedules.value = [...schedules.value, response.data.schedule]
    }
    else {
      error.value = 'Failed to create schedule'
    }

    return response
  }

  const deleteSchedule = async (scheduleId: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdSchedulesDelete({
      path: { id: tenantId.value },
      body: { id: scheduleId },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete schedule'
    }
    else {
      schedules.value = schedules.value.filter(s => s.id !== scheduleId)
    }

    return response
  }

  const createRotation = async (scheduleId: string, rotation: TenantRequestRotation) => {
    loading.value = true
    error.value = null

    const response = await postSchedulesByIdRotationCreate({
      path: { id: scheduleId },
      body: rotation,
    })

    loading.value = false

    if (response.data?.rotation) {
      const newRotation = response.data.rotation
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, rotations: [...(s.rotations ?? []), newRotation] }
        }
        return s
      })
    }
    else {
      error.value = 'Failed to create rotation'
    }

    return response
  }

  const deleteRotation = async (scheduleId: string, rotationIndex: number) => {
    loading.value = true
    error.value = null

    const response = await postSchedulesByIdRotationDelete({
      path: { id: scheduleId },
      body: { number: rotationIndex },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete rotation'
    }
    else {
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, rotations: (s.rotations ?? []).filter((_, i) => i !== rotationIndex) }
        }
        return s
      })
    }

    return response
  }

  const createOverride = async (scheduleId: string, override: TenantRequestOverride) => {
    loading.value = true
    error.value = null

    const response = await postSchedulesByIdOverrideCreate({
      path: { id: scheduleId },
      body: override,
    })

    loading.value = false

    if (response.data?.rotation) {
      const newOverride = response.data.rotation
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, overrides: [...(s.overrides ?? []), newOverride] }
        }
        return s
      })
    }
    else {
      error.value = 'Failed to create override'
    }

    return response
  }

  const deleteOverride = async (scheduleId: string, overrideIndex: number) => {
    loading.value = true
    error.value = null

    const response = await postSchedulesByIdOverrideDelete({
      path: { id: scheduleId },
      body: { number: overrideIndex },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete override'
    }
    else {
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, overrides: (s.overrides ?? []).filter((_, i) => i !== overrideIndex) }
        }
        return s
      })
    }

    return response
  }

  return {
    schedules: readonly(schedules),
    loading: readonly(loading),
    error: readonly(error),
    fetchSchedules,
    createSchedule,
    deleteSchedule,
    createRotation,
    deleteRotation,
    createOverride,
    deleteOverride,
  }
}
