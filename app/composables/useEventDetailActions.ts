import type { ApiResponse } from '~/types/api'

interface EventEntity {
  id: string
}

interface EventActions<T> {
  addComment: (id: string, text: string) => Promise<ApiResponse<T>>
  deleteComment: (id: string, commentId: string) => Promise<ApiResponse<T>>
  addLabel: (id: string, key: string, value: string) => Promise<ApiResponse<T>>
  deleteLabel: (id: string, key: string) => Promise<ApiResponse<T>>
  setStatus: (id: string, status: 'acknowledged' | 'resolved') => Promise<ApiResponse<T>>
}

interface EventDetailActionsOptions<T> {
  entityRef: Ref<EventEntity | undefined>
  actions: EventActions<T>
  refresh: () => Promise<void>
}

export const useEventDetailActions = <T>(options: EventDetailActionsOptions<T>) => {
  const { entityRef, actions, refresh } = options
  const toast = useToast()
  const actionLoading = ref(false)

  const executeAction = async <R>(
    action: (entityId: string) => Promise<ApiResponse<R>>,
    errorMessage: string,
    successMessage: string,
  ): Promise<boolean> => {
    const entity = entityRef.value
    if (!entity) {
      return false
    }

    actionLoading.value = true
    const response = await action(entity.id)
    actionLoading.value = false

    if ('error' in response && response.error) {
      toast.error(errorMessage)
      return false
    }

    await refresh()
    toast.success(successMessage)
    return true
  }

  const handleAddComment = (text: string) =>
    executeAction(
      entityId => actions.addComment(entityId, text),
      'Не удалось добавить комментарий',
      'Комментарий добавлен',
    )

  const handleDeleteComment = (commentId: string) =>
    executeAction(
      entityId => actions.deleteComment(entityId, commentId),
      'Не удалось удалить комментарий',
      'Комментарий удалён',
    )

  const handleAddLabel = (key: string, value: string) =>
    executeAction(
      entityId => actions.addLabel(entityId, key, value),
      'Не удалось добавить метку',
      'Метка добавлена',
    )

  const handleDeleteLabel = (key: string) =>
    executeAction(
      entityId => actions.deleteLabel(entityId, key),
      'Не удалось удалить метку',
      'Метка удалена',
    )

  const handleSetStatus = (status: 'acknowledged' | 'resolved') =>
    executeAction(
      entityId => actions.setStatus(entityId, status),
      'Не удалось изменить статус',
      'Статус изменён',
    )

  return {
    actionLoading: readonly(actionLoading),
    handleAddComment,
    handleDeleteComment,
    handleAddLabel,
    handleDeleteLabel,
    handleSetStatus,
  }
}
