const isStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  }
  catch {
    return false
  }
}

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (!isStorageAvailable()) {
      return null
    }

    try {
      return localStorage.getItem(key)
    }
    catch {
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isStorageAvailable()) {
      return false
    }

    try {
      localStorage.setItem(key, value)
      return true
    }
    catch {
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (!isStorageAvailable()) {
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    }
    catch {
      return false
    }
  },

  getJSON: <T>(key: string): T | null => {
    const value = safeStorage.getItem(key)
    if (value === null) {
      return null
    }

    try {
      return JSON.parse(value) as T
    }
    catch {
      return null
    }
  },

  setJSON: <T>(key: string, value: T): boolean => {
    try {
      const serialized = JSON.stringify(value)
      return safeStorage.setItem(key, serialized)
    }
    catch {
      return false
    }
  },
}
