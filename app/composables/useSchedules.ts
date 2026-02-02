import { client } from '~/api/client.gen'
import type {
  TenantResponseSchedule,
  TenantResponseScheduleList,
  TenantResponseSingleSchedule,
  TenantResponseSingleRotation,
  TenantResponseSingleOverride,
  TenantRequestNewSchedule,
  TenantRequestRotation,
  TenantRequestOverride,
  TenantRequestId,
  TenantRequestNumber,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useSchedules = (tenantId: Ref<string>) => {
  const schedules = ref<ReadonlyArray<TenantResponseSchedule>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedules = async (): Promise<ApiResponse<TenantResponseScheduleList> | null> => {
    if (!tenantId.value) {
      return null
    }

    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants/{id}/schedules',
      path: { id: tenantId.value },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseScheduleList>)
    if (data?.schedules) {
      schedules.value = data.schedules
    }
    else {
      error.value = 'Failed to fetch schedules'
    }

    return response as ApiResponse<TenantResponseScheduleList>
  }

  const createSchedule = async (schedule: TenantRequestNewSchedule): Promise<ApiResponse<TenantResponseSingleSchedule>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/tenants/{id}/schedules/create',
      path: { id: tenantId.value },
      body: schedule,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleSchedule>)
    if (data?.schedule) {
      schedules.value = [...schedules.value, data.schedule]
    }
    else {
      error.value = 'Failed to create schedule'
    }

    return response as ApiResponse<TenantResponseSingleSchedule>
  }

  const deleteSchedule = async (scheduleId: string): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestId = { id: scheduleId }
    const response = await client.post({
      url: '/tenants/{id}/schedules/delete',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to delete schedule'
    }
    else {
      schedules.value = schedules.value.filter(s => s.id !== scheduleId)
    }

    return response as ApiResponse<void>
  }

  const createRotation = async (scheduleId: string, rotation: TenantRequestRotation): Promise<ApiResponse<TenantResponseSingleRotation>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/schedules/{id}/rotation/create',
      path: { id: scheduleId },
      body: rotation,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleRotation>)
    if (data?.rotation) {
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, rotations: [...(s.rotations ?? []), data.rotation] }
        }
        return s
      })
    }
    else {
      error.value = 'Failed to create rotation'
    }

    return response as ApiResponse<TenantResponseSingleRotation>
  }

  const deleteRotation = async (scheduleId: string, rotationIndex: number): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestNumber = { number: rotationIndex }
    const response = await client.post({
      url: '/schedules/{id}/rotation/delete',
      path: { id: scheduleId },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
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

    return response as ApiResponse<void>
  }

  const createOverride = async (scheduleId: string, override: TenantRequestOverride): Promise<ApiResponse<TenantResponseSingleOverride>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/schedules/{id}/override/create',
      path: { id: scheduleId },
      body: override,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleOverride>)
    if (data?.rotation) {
      schedules.value = schedules.value.map((s) => {
        if (s.id === scheduleId) {
          return { ...s, overrides: [...(s.overrides ?? []), data.rotation] }
        }
        return s
      })
    }
    else {
      error.value = 'Failed to create override'
    }

    return response as ApiResponse<TenantResponseSingleOverride>
  }

  const deleteOverride = async (scheduleId: string, overrideIndex: number): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestNumber = { number: overrideIndex }
    const response = await client.post({
      url: '/schedules/{id}/override/delete',
      path: { id: scheduleId },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
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

    return response as ApiResponse<void>
  }

  watch(tenantId, () => {
    if (tenantId.value) {
      fetchSchedules()
    }
  })

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
