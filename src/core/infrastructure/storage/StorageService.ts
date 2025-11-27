export class StorageService {
  private prefix: string
  private encryptionKey?: string

  constructor(config: { prefix: string; encryptionKey?: string }) {
    this.prefix = config.prefix
    this.encryptionKey = config.encryptionKey
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const storageKey = `${this.prefix}${key}`
    const storageValue = this.encryptionKey ? this.encrypt(JSON.stringify(value)) : JSON.stringify(value)
    localStorage.setItem(storageKey, storageValue)
  }

  async getItem<T>(key: string): Promise<T | null> {
    const storageKey = `${this.prefix}${key}`
    const storageValue = localStorage.getItem(storageKey)
    if (!storageValue) return null
    try {
      const value = this.encryptionKey ? JSON.parse(this.decrypt(storageValue)) : JSON.parse(storageValue)
      return value as T
    } catch {
      return null
    }
  }

  async removeItem(key: string): Promise<void> {
    const storageKey = `${this.prefix}${key}`
    localStorage.removeItem(storageKey)
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    }
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) return data
    let result = ''
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ this.encryptionKey!.charCodeAt(i % this.encryptionKey!.length))
    }
    return btoa(result)
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) return data
    const decoded = atob(data)
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ this.encryptionKey!.charCodeAt(i % this.encryptionKey!.length))
    }
    return result
  }
}
