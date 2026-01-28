import type {
  EventResponseIncident,
  EventResponseIncidentList,
  EventResponseSingleIncident,
  EventRequestIncident,
  EventRequestComment,
  EventRequestId,
  EventRequestKeyValue,
  EventRequestKey,
  EventRequestStatus,
} from '~/api/types.gen'
import { client } from '~/api/client.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useIncidents = () => {
  const incidents = useState<ReadonlyArray<EventResponseIncident>>('incidents', () => [])
  const total = useState<number>('incidents-total', () => 0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchIncidents = async (limit?: number, offset?: number): Promise<ApiResponse<EventResponseIncidentList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/incidents',
      query: { limit, offset },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseIncidentList>)
    if (data?.incidents) {
      incidents.value = data.incidents
      total.value = data.total
    }
    else {
      error.value = 'Failed to fetch incidents'
    }

    return response as ApiResponse<EventResponseIncidentList>
  }

  const fetchIncident = async (id: string): Promise<ApiResponse<EventResponseSingleIncident> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/incidents/{id}',
      path: { id },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (!data?.incident) {
      error.value = 'Failed to fetch incident'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const createIncident = async (tenantId: string, title: string, description?: string): Promise<ApiResponse<EventResponseIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestIncident = {
      tenant: { id: tenantId },
      title,
      description,
    }
    const response = await client.post({
      url: '/incidents/create',
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseIncident>)
    if (data) {
      incidents.value = [...incidents.value, data]
      total.value = total.value + 1
    }
    else {
      error.value = 'Failed to create incident'
    }

    return response as ApiResponse<EventResponseIncident>
  }

  const addComment = async (incidentId: string, text: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestComment = { text }
    const response = await client.post({
      url: '/incidents/{id}/comments/add',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to add comment'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const deleteComment = async (incidentId: string, commentId: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestId = { id: commentId }
    const response = await client.post({
      url: '/incidents/{id}/comments/delete',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to delete comment'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const addLabel = async (incidentId: string, key: string, value: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKeyValue = { key, value }
    const response = await client.post({
      url: '/incidents/{id}/labels/add',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to add label'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const deleteLabel = async (incidentId: string, key: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestKey = { key }
    const response = await client.post({
      url: '/incidents/{id}/labels/delete',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to delete label'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const setStatus = async (incidentId: string, status: 'acknowledged' | 'resolved'): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestStatus = { status }
    const response = await client.post({
      url: '/incidents/{id}/status/set',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to set status'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const addAlert = async (incidentId: string, alertId: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestId = { id: alertId }
    const response = await client.post({
      url: '/incidents/{id}/alerts/add',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to add alert'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const removeAlert = async (incidentId: string, alertId: string): Promise<ApiResponse<EventResponseSingleIncident>> => {
    loading.value = true
    error.value = null

    const body: EventRequestId = { id: alertId }
    const response = await client.post({
      url: '/incidents/{id}/alerts/delete',
      path: { id: incidentId },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<EventResponseSingleIncident>)
    if (data?.incident) {
      incidents.value = incidents.value.map(i => i.id === incidentId ? data.incident : i)
    }
    else {
      error.value = 'Failed to remove alert'
    }

    return response as ApiResponse<EventResponseSingleIncident>
  }

  const getIncidentById = (id: string): EventResponseIncident | undefined => {
    return incidents.value.find(i => i.id === id)
  }

  const currentStatus = (incident: EventResponseIncident): string => {
    if (incident.statuses.length === 0) {
      return 'created'
    }
    const sorted = [...incident.statuses].sort((a, b) => b.created - a.created)
    return sorted[0]?.status ?? 'created'
  }

  return {
    incidents: readonly(incidents),
    total: readonly(total),
    loading: readonly(loading),
    error: readonly(error),
    fetchIncidents,
    fetchIncident,
    createIncident,
    addComment,
    deleteComment,
    addLabel,
    deleteLabel,
    setStatus,
    addAlert,
    removeAlert,
    getIncidentById,
    currentStatus,
  }
}
