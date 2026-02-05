import type {
  EventResponseIncident,
  EventResponseIncidentList,
  EventResponseSingleIncident,
} from '~/api/types.gen'
import {
  postIncidentsCreate,
  postIncidentsByIdAlertsAdd,
  postIncidentsByIdAlertsDelete,
} from '~/api/sdk.gen'
import { useEventEntity } from './useEventEntity'

export const useIncidents = () => {
  const base = useEventEntity<EventResponseIncident, EventResponseIncidentList, EventResponseSingleIncident>({
    stateKey: 'incidents',
    totalKey: 'incidents-total',
    basePath: '/incidents',
    getListItems: data => data.incidents,
    getListTotal: data => data.total,
    getSingleItem: data => data.incident,
  })

  const createIncident = async (tenantId: string, title: string, description?: string) => {
    base.setLoading(true)
    base.setError(null)

    const response = await postIncidentsCreate({
      body: {
        tenant: { id: tenantId },
        title,
        description,
      },
    })

    base.setLoading(false)

    if (response.data) {
      base.items.value = [...base.items.value, response.data]
    }
    else {
      base.setError('Failed to create incident')
    }

    return response
  }

  const addAlert = async (incidentId: string, alertId: string) => {
    base.setLoading(true)
    base.setError(null)

    const response = await postIncidentsByIdAlertsAdd({
      path: { id: incidentId },
      body: { id: alertId },
    })

    base.setLoading(false)

    if (response.data?.incident) {
      base.updateItem(incidentId, response.data.incident)
    }
    else {
      base.setError('Failed to add alert')
    }

    return response
  }

  const removeAlert = async (incidentId: string, alertId: string) => {
    base.setLoading(true)
    base.setError(null)

    const response = await postIncidentsByIdAlertsDelete({
      path: { id: incidentId },
      body: { id: alertId },
    })

    base.setLoading(false)

    if (response.data?.incident) {
      base.updateItem(incidentId, response.data.incident)
    }
    else {
      base.setError('Failed to remove alert')
    }

    return response
  }

  return {
    incidents: readonly(base.items),
    total: base.total,
    loading: base.loading,
    error: base.error,
    fetchIncidents: base.fetchList,
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
