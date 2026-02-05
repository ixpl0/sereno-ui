import type {
  EventRequestComment,
  EventRequestId,
  EventRequestKeyValue,
  EventRequestKey,
  EventRequestStatus,
} from '~/api/types.gen'
import { getCurrentEventStatus } from '~/utils/event'

type SdkResponse<T> = { data: T | undefined, error: unknown }

interface SdkFunctions<TList, TSingle> {
  getList: (options?: { query?: { limit?: number, offset?: number } }) => Promise<SdkResponse<TList>>
  getSingle: (options: { path: { id: string } }) => Promise<SdkResponse<TSingle>>
  addComment: (options: { path: { id: string }, body: EventRequestComment }) => Promise<SdkResponse<TSingle>>
  deleteComment: (options: { path: { id: string }, body: EventRequestId }) => Promise<SdkResponse<TSingle>>
  addLabel: (options: { path: { id: string }, body: EventRequestKeyValue }) => Promise<SdkResponse<TSingle>>
  deleteLabel: (options: { path: { id: string }, body: EventRequestKey }) => Promise<SdkResponse<TSingle>>
  setStatus: (options: { path: { id: string }, body: EventRequestStatus }) => Promise<SdkResponse<TSingle>>
}

interface EventEntityConfig<TEntity, TList, TSingle> {
  stateKey: string
  totalKey: string
  sdk: SdkFunctions<TList, TSingle>
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

  const fetchList = async (limit?: number, offset?: number) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.getList({ query: { limit, offset } })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      items.value = config.getListItems(response.data)
      total.value = config.getListTotal(response.data)
    }
    else {
      setError(`Failed to fetch ${config.stateKey}`)
    }

    return response
  }

  const fetchSingle = async (id: string) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.getSingle({ path: { id } })

    setLoading(false)

    if (response.error !== undefined || response.data === undefined) {
      setError(`Failed to fetch item`)
    }

    return response
  }

  const addComment = async (entityId: string, text: string) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.addComment({
      path: { id: entityId },
      body: { text },
    })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      updateItem(entityId, config.getSingleItem(response.data))
    }
    else {
      setError('Failed to add comment')
    }

    return response
  }

  const deleteComment = async (entityId: string, commentId: string) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.deleteComment({
      path: { id: entityId },
      body: { id: commentId },
    })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      updateItem(entityId, config.getSingleItem(response.data))
    }
    else {
      setError('Failed to delete comment')
    }

    return response
  }

  const addLabel = async (entityId: string, key: string, value: string) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.addLabel({
      path: { id: entityId },
      body: { key, value },
    })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      updateItem(entityId, config.getSingleItem(response.data))
    }
    else {
      setError('Failed to add label')
    }

    return response
  }

  const deleteLabel = async (entityId: string, key: string) => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.deleteLabel({
      path: { id: entityId },
      body: { key },
    })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      updateItem(entityId, config.getSingleItem(response.data))
    }
    else {
      setError('Failed to delete label')
    }

    return response
  }

  const setStatus = async (entityId: string, status: 'acknowledged' | 'resolved') => {
    setLoading(true)
    setError(null)

    const response = await config.sdk.setStatus({
      path: { id: entityId },
      body: { status },
    })

    setLoading(false)

    if (response.error === undefined && response.data !== undefined) {
      updateItem(entityId, config.getSingleItem(response.data))
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
