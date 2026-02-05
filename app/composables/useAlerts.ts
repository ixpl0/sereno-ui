import type {
  EventResponseAlert,
  EventResponseAlertList,
  EventResponseSingleAlert,
} from '~/api/types.gen'
import {
  postAlertsByIdAnnotationsAdd,
  postAlertsByIdAnnotationsDelete,
} from '~/api/sdk.gen'
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

  const addAnnotation = async (alertId: string, key: string, value: string) => {
    base.setLoading(true)
    base.setError(null)

    const response = await postAlertsByIdAnnotationsAdd({
      path: { id: alertId },
      body: { key, value },
    })

    base.setLoading(false)

    if (response.data?.alert) {
      base.updateItem(alertId, response.data.alert)
    }
    else {
      base.setError('Failed to add annotation')
    }

    return response
  }

  const deleteAnnotation = async (alertId: string, key: string) => {
    base.setLoading(true)
    base.setError(null)

    const response = await postAlertsByIdAnnotationsDelete({
      path: { id: alertId },
      body: { key },
    })

    base.setLoading(false)

    if (response.data?.alert) {
      base.updateItem(alertId, response.data.alert)
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
