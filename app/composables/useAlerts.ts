import type {
  EventResponseAlert,
  EventResponseAlertList,
  EventResponseSingleAlert,
  EventRequestKeyValue,
  EventRequestKey,
} from '~/api/types.gen'
import { client } from '~/api/client.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'
import { useEventEntity } from './useEventEntity'

export const useAlerts = () => {
  const base = useEventEntity<EventResponseAlert, EventResponseAlertList, EventResponseSingleAlert>({
    stateKey: 'alerts',
    totalKey: 'alerts-total',
    basePath: '/alerts',
    getListItems: data => data.alerts,
    getListTotal: data => data.total,
    getSingleItem: data => data.alert,
  })

  const addAnnotation = async (alertId: string, key: string, value: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    base.setLoading(true)
    base.setError(null)

    const body: EventRequestKeyValue = { key, value }
    const response = await client.post({
      url: '/alerts/{id}/annotations/add',
      path: { id: alertId },
      body,
    }) as ApiResponse<EventResponseSingleAlert>

    base.setLoading(false)

    const data = getApiData(response)
    if (data?.alert) {
      base.updateItem(alertId, data.alert)
    }
    else {
      base.setError('Failed to add annotation')
    }

    return response
  }

  const deleteAnnotation = async (alertId: string, key: string): Promise<ApiResponse<EventResponseSingleAlert>> => {
    base.setLoading(true)
    base.setError(null)

    const body: EventRequestKey = { key }
    const response = await client.post({
      url: '/alerts/{id}/annotations/delete',
      path: { id: alertId },
      body,
    }) as ApiResponse<EventResponseSingleAlert>

    base.setLoading(false)

    const data = getApiData(response)
    if (data?.alert) {
      base.updateItem(alertId, data.alert)
    }
    else {
      base.setError('Failed to delete annotation')
    }

    return response
  }

  return {
    alerts: readonly(base.items),
    total: base.total,
    loading: base.loading,
    error: base.error,
    fetchAlerts: base.fetchList,
    fetchAlert: base.fetchSingle,
    addComment: base.addComment,
    deleteComment: base.deleteComment,
    addLabel: base.addLabel,
    deleteLabel: base.deleteLabel,
    addAnnotation,
    deleteAnnotation,
    setStatus: base.setStatus,
    getAlertById: base.getById,
    currentStatus: base.currentStatus,
  }
}
