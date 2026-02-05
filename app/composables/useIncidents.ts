import type {
  EventResponseIncident,
  EventResponseIncidentList,
  EventResponseSingleIncident,
} from '~/api/types.gen'
import {
  getIncidents,
  getIncidentsById,
  postIncidentsCreate,
  postIncidentsByIdCommentsAdd,
  postIncidentsByIdCommentsDelete,
  postIncidentsByIdLabelsAdd,
  postIncidentsByIdLabelsDelete,
  postIncidentsByIdStatusSet,
  postIncidentsByIdAlertsAdd,
  postIncidentsByIdAlertsDelete,
} from '~/api/sdk.gen'
import { useEventEntity } from './useEventEntity'

export const useIncidents = () => {
  const base = useEventEntity<EventResponseIncident, EventResponseIncidentList, EventResponseSingleIncident>({
    stateKey: 'incidents',
    sdk: {
      getList: getIncidents,
      getSingle: getIncidentsById,
      addComment: postIncidentsByIdCommentsAdd,
      deleteComment: postIncidentsByIdCommentsDelete,
      addLabel: postIncidentsByIdLabelsAdd,
      deleteLabel: postIncidentsByIdLabelsDelete,
      setStatus: postIncidentsByIdStatusSet,
    },
    getListItems: data => data.incidents,
    getListTotal: data => data.total,
    getSingleItem: data => data.incident,
  })

  const createIncident = async (tenantId: string, title: string, description?: string) => {
    const result = await postIncidentsCreate({
      body: {
        tenant: { id: tenantId },
        title,
        description,
      },
    })

    if (result.data) {
      await base.refresh()
    }

    return result
  }

  const addAlert = async (incidentId: string, alertId: string) => {
    const result = await postIncidentsByIdAlertsAdd({
      path: { id: incidentId },
      body: { id: alertId },
    })

    if (result.data?.incident) {
      await base.refresh()
    }

    return result
  }

  const removeAlert = async (incidentId: string, alertId: string) => {
    const result = await postIncidentsByIdAlertsDelete({
      path: { id: incidentId },
      body: { id: alertId },
    })

    if (result.data?.incident) {
      await base.refresh()
    }

    return result
  }

  return {
    incidents: base.items,
    total: base.total,
    loading: base.loading,
    refresh: base.refresh,
    fetchIncident: base.fetchSingle,
    createIncident,
    addComment: base.addComment,
    deleteComment: base.deleteComment,
    addLabel: base.addLabel,
    deleteLabel: base.deleteLabel,
    setStatus: base.setStatus,
    addAlert,
    removeAlert,
    getIncidentById: base.getById,
    currentStatus: base.currentStatus,
  }
}
