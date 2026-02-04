import { client } from '~/api/client.gen'
import type {
  EventRequestComment,
  EventRequestId,
  EventRequestKeyValue,
  EventRequestKey,
  EventRequestStatus,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'
import { getCurrentEventStatus } from '~/utils/event'

type EntityPath = '/alerts' | '/incidents'

interface EventEntityConfig<TEntity, TList, TSingle> {
  stateKey: string
  totalKey: string
  basePath: EntityPath
  getListItems: (data: TList) => ReadonlyArray<TEntity>
  getListTotal: (data: TList) => number
  getSingleItem: (data: TSingle) => TEntity
}

export const useEventEntity = <
  TEntity extends { id: string },
  TList,
  TSingle,
>(config: EventEntityConfig<TEntity, TList, TSingle>) => {
  const items = useState<ReadonlyArray<TEntity>>(config.stateKey, () => [])
  const total = useState<number>(config.totalKey, () => 0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const updateItem = (id: string, updatedItem: TEntity) => {
    items.value = items.value.map(item => item.id === id ? updatedItem : item)
  }

  const fetchList = async (limit?: number, offset?: number): Promise<ApiResponse<TList>> => {
    setLoading(true)
    setError(null)

    const response = await client.get({
      url: config.basePath,
      query: { limit, offset },
    }) as ApiResponse<TList>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      items.value = config.getListItems(data)
      total.value = config.getListTotal(data)
    }
    else {
      setError(`Failed to fetch ${config.stateKey}`)
    }

    return response
  }

  const fetchSingle = async (id: string): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const response = await client.get({
      url: `${config.basePath}/{id}` as '/alerts/{id}',
      path: { id },
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (!data) {
      setError(`Failed to fetch item`)
    }

    return response
  }

  const addComment = async (entityId: string, text: string): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const body: EventRequestComment = { text }
    const response = await client.post({
      url: `${config.basePath}/{id}/comments/add` as '/alerts/{id}/comments/add',
      path: { id: entityId },
      body,
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      updateItem(entityId, config.getSingleItem(data))
    }
    else {
      setError('Failed to add comment')
    }

    return response
  }

  const deleteComment = async (entityId: string, commentId: string): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const body: EventRequestId = { id: commentId }
    const response = await client.post({
      url: `${config.basePath}/{id}/comments/delete` as '/alerts/{id}/comments/delete',
      path: { id: entityId },
      body,
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      updateItem(entityId, config.getSingleItem(data))
    }
    else {
      setError('Failed to delete comment')
    }

    return response
  }

  const addLabel = async (entityId: string, key: string, value: string): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const body: EventRequestKeyValue = { key, value }
    const response = await client.post({
      url: `${config.basePath}/{id}/labels/add` as '/alerts/{id}/labels/add',
      path: { id: entityId },
      body,
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      updateItem(entityId, config.getSingleItem(data))
    }
    else {
      setError('Failed to add label')
    }

    return response
  }

  const deleteLabel = async (entityId: string, key: string): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const body: EventRequestKey = { key }
    const response = await client.post({
      url: `${config.basePath}/{id}/labels/delete` as '/alerts/{id}/labels/delete',
      path: { id: entityId },
      body,
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      updateItem(entityId, config.getSingleItem(data))
    }
    else {
      setError('Failed to delete label')
    }

    return response
  }

  const setStatus = async (entityId: string, status: 'acknowledged' | 'resolved'): Promise<ApiResponse<TSingle>> => {
    setLoading(true)
    setError(null)

    const body: EventRequestStatus = { status }
    const response = await client.post({
      url: `${config.basePath}/{id}/status/set` as '/alerts/{id}/status/set',
      path: { id: entityId },
      body,
    }) as ApiResponse<TSingle>

    setLoading(false)

    const data = getApiData(response)
    if (data) {
      updateItem(entityId, config.getSingleItem(data))
    }
    else {
      setError('Failed to set status')
    }

    return response
  }

  const getById = (id: string): TEntity | undefined => {
    return items.value.find(item => item.id === id)
  }

  return {
    items,
    total: readonly(total),
    loading: readonly(loading),
    error: readonly(error),
    fetchList,
    fetchSingle,
    addComment,
    deleteComment,
    addLabel,
    deleteLabel,
    setStatus,
    getById,
    updateItem,
    setLoading,
    setError,
    currentStatus: getCurrentEventStatus,
  }
}
