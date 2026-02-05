import type {
  EventResponseAlert,
  EventResponseAlertList,
  EventResponseSingleAlert,
} from '~/api/types.gen'
import {
  getAlerts,
  getAlertsById,
  postAlertsByIdCommentsAdd,
  postAlertsByIdCommentsDelete,
  postAlertsByIdLabelsAdd,
  postAlertsByIdLabelsDelete,
  postAlertsByIdStatusSet,
  postAlertsByIdAnnotationsAdd,
  postAlertsByIdAnnotationsDelete,
} from '~/api/sdk.gen'
import { useEventEntity } from './useEventEntity'

export const useAlerts = () => {
  const base = useEventEntity<EventResponseAlert, EventResponseAlertList, EventResponseSingleAlert>({
    stateKey: 'alerts',
    sdk: {
      getList: getAlerts,
      getSingle: getAlertsById,
      addComment: postAlertsByIdCommentsAdd,
      deleteComment: postAlertsByIdCommentsDelete,
      addLabel: postAlertsByIdLabelsAdd,
      deleteLabel: postAlertsByIdLabelsDelete,
      setStatus: postAlertsByIdStatusSet,
    },
    getListItems: data => data.alerts,
    getListTotal: data => data.total,
    getSingleItem: data => data.alert,
  })

  const addAnnotation = async (alertId: string, key: string, value: string) => {
    const result = await postAlertsByIdAnnotationsAdd({
      path: { id: alertId },
      body: { key, value },
    })

    if (result.data?.alert) {
      await base.refresh()
    }

    return result
  }

  const deleteAnnotation = async (alertId: string, key: string) => {
    const result = await postAlertsByIdAnnotationsDelete({
      path: { id: alertId },
      body: { key },
    })

    if (result.data?.alert) {
      await base.refresh()
    }

    return result
  }

  return {
    alerts: base.items,
    total: base.total,
    loading: base.loading,
    refresh: base.refresh,
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
