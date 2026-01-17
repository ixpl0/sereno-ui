interface EditableFieldOptions {
  onSave: (value: string) => Promise<void>
  getInitialValue: () => string
}

export const useEditableField = (options: EditableFieldOptions) => {
  const { onSave, getInitialValue } = options

  const isEditing = ref(false)
  const editValue = ref('')
  const inputRef = ref<{ focus: () => void, select: () => void } | null>(null)

  const startEdit = () => {
    isEditing.value = true
    editValue.value = getInitialValue()
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }

  const cancelEdit = () => {
    isEditing.value = false
    editValue.value = ''
  }

  const saveEdit = async () => {
    if (!isEditing.value) {
      return
    }

    await onSave(editValue.value)
    cancelEdit()
  }

  return {
    isEditing: readonly(isEditing),
    editValue,
    inputRef,
    startEdit,
    cancelEdit,
    saveEdit,
  }
}
