interface EventEntity {
  id: string
}

interface ActionResponse {
  data: unknown
  error: unknown
}

interface EventActions {
  addComment: (id: string, text: string) => Promise<ActionResponse>
  deleteComment: (id: string, commentId: string) => Promise<ActionResponse>
  addLabel: (id: string, key: string, value: string) => Promise<ActionResponse>
  deleteLabel: (id: string, key: string) => Promise<ActionResponse>
  setStatus: (id: string, status: 'acknowledged' | 'resolved') => Promise<ActionResponse>
}

interface EventDetailActionsOptions {
  entityRef: Ref<EventEntity | undefined>
  actions: EventActions
  refresh: () => Promise<void>
}

export const useEventDetailActions = (options: EventDetailActionsOptions) => {
  const { entityRef, actions, refresh } = options
  const toast = useToast()
  const actionLoading = ref(false)

  const executeAction = async (
    action: (entityId: string) => Promise<ActionResponse>,
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

    if (response.error) {
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
