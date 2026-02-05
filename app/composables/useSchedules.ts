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
  TenantResponseScheduleList,
  TenantRequestNewSchedule,
  TenantRequestRotation,
  TenantRequestOverride,
} from '~/api/types.gen'

export const useSchedules = (tenantId: Ref<string>) => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    () => `schedules-${tenantId.value}`,
    async () => {
      if (!tenantId.value) {
        await waitForRef(tenantId)
      }
      if (!tenantId.value) {
        return null
      }
      const result = await client.get<{ 200: TenantResponseScheduleList }>({
        url: '/tenants/{id}/schedules',
        path: { id: tenantId.value },
      })
      if (result.error) {
        throw createError({ message: 'Failed to fetch schedules' })
      }
      return result.data
    },
    { watch: [tenantId] },
  )

  const schedules = computed(() => response.value?.schedules ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const createSchedule = async (schedule: TenantRequestNewSchedule) => {
    const result = await postTenantsByIdSchedulesCreate({
      path: { id: tenantId.value },
      body: schedule,
    })

    if (result.data?.schedule) {
      await refresh()
    }

    return result
  }

  const deleteSchedule = async (scheduleId: string) => {
    const result = await postTenantsByIdSchedulesDelete({
      path: { id: tenantId.value },
      body: { id: scheduleId },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  const createRotation = async (scheduleId: string, rotation: TenantRequestRotation) => {
    const result = await postSchedulesByIdRotationCreate({
      path: { id: scheduleId },
      body: rotation,
    })

    if (result.data?.rotation) {
      await refresh()
    }

    return result
  }

  const deleteRotation = async (scheduleId: string, rotationIndex: number) => {
    const result = await postSchedulesByIdRotationDelete({
      path: { id: scheduleId },
      body: { number: rotationIndex },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  const createOverride = async (scheduleId: string, override: TenantRequestOverride) => {
    const result = await postSchedulesByIdOverrideCreate({
      path: { id: scheduleId },
      body: override,
    })

    if (result.data?.rotation) {
      await refresh()
    }

    return result
  }

  const deleteOverride = async (scheduleId: string, overrideIndex: number) => {
    const result = await postSchedulesByIdOverrideDelete({
      path: { id: scheduleId },
      body: { number: overrideIndex },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  return {
    schedules,
    loading,
    refresh,
    createSchedule,
    deleteSchedule,
    createRotation,
    deleteRotation,
    createOverride,
    deleteOverride,
  }
}
