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
  const { data: response, status: fetchStatus, refresh } = useAsyncData<TList>(
    config.stateKey,
    async () => {
      const result = await config.sdk.getList()
      if (result.error !== undefined || result.data === undefined) {
        throw createError({ message: `Failed to fetch ${config.stateKey}` })
      }
      return result.data
    },
  )

  const items = computed(() => response.value ? config.getListItems(response.value as TList) : [])
  const total = computed(() => response.value ? config.getListTotal(response.value as TList) : 0)
  const loading = computed(() => fetchStatus.value === 'pending')

  const fetchSingle = async (id: string) => {
    const result = await config.sdk.getSingle({ path: { id } })

    if (result.error !== undefined || result.data === undefined) {
      throw createError({ message: 'Failed to fetch item' })
    }

    return result
  }

  const addComment = async (entityId: string, text: string) => {
    const result = await config.sdk.addComment({
      path: { id: entityId },
      body: { text },
    })

    if (result.error === undefined && result.data !== undefined) {
      await refresh()
    }

    return result
  }

  const deleteComment = async (entityId: string, commentId: string) => {
    const result = await config.sdk.deleteComment({
      path: { id: entityId },
      body: { id: commentId },
    })

    if (result.error === undefined && result.data !== undefined) {
      await refresh()
    }

    return result
  }

  const addLabel = async (entityId: string, key: string, value: string) => {
    const result = await config.sdk.addLabel({
      path: { id: entityId },
      body: { key, value },
    })

    if (result.error === undefined && result.data !== undefined) {
      await refresh()
    }

    return result
  }

  const deleteLabel = async (entityId: string, key: string) => {
    const result = await config.sdk.deleteLabel({
      path: { id: entityId },
      body: { key },
    })

    if (result.error === undefined && result.data !== undefined) {
      await refresh()
    }

    return result
  }

  const setStatus = async (entityId: string, status: 'acknowledged' | 'resolved') => {
    const result = await config.sdk.setStatus({
      path: { id: entityId },
      body: { status },
    })

    if (result.error === undefined && result.data !== undefined) {
      await refresh()
    }

    return result
  }

  const getById = (id: string): TEntity | undefined => {
    return items.value.find(item => item.id === id)
  }

  return {
    items,
    total,
    loading,
    refresh,
    fetchSingle,
    addComment,
    deleteComment,
    addLabel,
    deleteLabel,
    setStatus,
    getById,
    getSingleItem: config.getSingleItem,
    currentStatus: getCurrentEventStatus,
  }
}
