import type {
  EventResponseIncident,
  EventResponseIncidentList,
  EventResponseSingleIncident,
  EventRequestIncident,
  EventRequestId,
} from '~/api/types.gen'
import { client } from '~/api/client.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'
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

  const createIncident = async (tenantId: string, title: string, description?: string): Promise<ApiResponse<EventResponseIncident>> => {
    base.setLoading(true)
    base.setError(null)

    const body: EventRequestIncident = {
      tenant: { id: tenantId },
      title,
      description,
    }
    const response = await client.post({
      url: '/incidents/create',
      body,
    }) as ApiResponse<EventResponseIncident>

    base.setLoading(false)

    const data = getApiData(response)
    if (data) {
      base.items.value = [...base.items.value, data]
    }
    else {
      base.setError('Failed to create incident')
    }

    return response
  }

  const addAlert = async (incidentId: string, alertId: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    base.setLoading(true)
    base.setError(null)

    const body: EventRequestId = { id: alertId }
    const response = await client.post({
      url: '/incidents/{id}/alerts/add',
      path: { id: incidentId },
      body,
    }) as ApiResponse<EventResponseSingleIncident>

    base.setLoading(false)

    const data = getApiData(response)
    if (data?.incident) {
      base.updateItem(incidentId, data.incident)
    }
    else {
      base.setError('Failed to add alert')
    }

    return response
  }

  const removeAlert = async (incidentId: string, alertId: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    base.setLoading(true)
    base.setError(null)

    const body: EventRequestId = { id: alertId }
    const response = await client.post({
      url: '/incidents/{id}/alerts/delete',
      path: { id: incidentId },
      body,
    }) as ApiResponse<EventResponseSingleIncident>

    base.setLoading(false)

    const data = getApiData(response)
    if (data?.incident) {
      base.updateItem(incidentId, data.incident)
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
