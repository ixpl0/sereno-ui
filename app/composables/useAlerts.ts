import type {
  EventResponseAlert,
  EventResponseAlertList,
  EventResponseSingleAlert,
  EventRequestComment,
  EventRequestId,
  EventRequestKeyValue,
  EventRequestKey,
  EventRequestStatus,
} from '~/api/types.gen'
import { client } from '~/api/client.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useAlerts = () => {
  const alerts = useState<ReadonlyArray<EventResponseAlert>>('alerts', () => [])
  const total = useState<number>('alerts-total', () => 0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAlerts = async (limit?: number, offset?: number): Promise<ApiResponse<EventResponseAlertList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/alerts',
      query: { limit, offset },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseAlertList>)
    if (data?.alerts) {
      alerts.value = data.alerts
      total.value = data.total
    }
    else {
      error.value = 'Failed to fetch alerts'
    }

    return response as ApiResponse<EventResponseAlertList>
  }

  const fetchAlert = async (id: string): Promise<ApiResponse<EventResponseSingleAlert> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/alerts/{id}',
      path: { id },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (!data?.alert) {
      error.value = 'Failed to fetch alert'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const addComment = async (alertId: string, text: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestComment = { text }
    const response = await client.post({
      url: '/alerts/{id}/comments/add',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to add comment'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const deleteComment = async (alertId: string, commentId: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestId = { id: commentId }
    const response = await client.post({
      url: '/alerts/{id}/comments/delete',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to delete comment'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const addLabel = async (alertId: string, key: string, value: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKeyValue = { key, value }
    const response = await client.post({
      url: '/alerts/{id}/labels/add',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to add label'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const deleteLabel = async (alertId: string, key: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKey = { key }
    const response = await client.post({
      url: '/alerts/{id}/labels/delete',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to delete label'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const addAnnotation = async (alertId: string, key: string, value: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKeyValue = { key, value }
    const response = await client.post({
      url: '/alerts/{id}/annotations/add',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to add annotation'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const deleteAnnotation = async (alertId: string, key: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKey = { key }
    const response = await client.post({
      url: '/alerts/{id}/annotations/delete',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to delete annotation'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const setStatus = async (alertId: string, status: 'acknowledged' | 'resolved'): Promise<ApiResponse<EventResponseSingleAlert>> => {
    loading.value = true
    error.value = null

    const body: EventRequestStatus = { status }
    const response = await client.post({
      url: '/alerts/{id}/status/set',
      path: { id: alertId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleAlert>)
    if (data?.alert) {
      alerts.value = alerts.value.map(a => a.id === alertId ? data.alert : a)
    }
    else {
      error.value = 'Failed to set status'
    }

    return response as ApiResponse<EventResponseSingleAlert>
  }

  const getAlertById = (id: string): EventResponseAlert | undefined => {
    return alerts.value.find(a => a.id === id)
  }

  const currentStatus = (alert: EventResponseAlert): string => {
    if (alert.statuses.length === 0) {
      return 'created'
    }
    const sorted = [...alert.statuses].sort((a, b) => b.since - a.since)
    return sorted[0]?.status ?? 'created'
  }

  return {
    alerts: readonly(alerts),
    total: readonly(total),
    loading: readonly(loading),
    error: readonly(error),
    fetchAlerts,
    fetchAlert,
    addComment,
    deleteComment,
    addLabel,
    deleteLabel,
    addAnnotation,
    deleteAnnotation,
    setStatus,
    getAlertById,
    currentStatus,
  }
}
