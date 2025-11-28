import { CORE_CONSTANTS } from '../../constants'
import { StorageService } from '../../infrastructure/storage/StorageService'

export class TokenService {
  private tokenKey: string
  private refreshTokenKey: string
  private storageService: StorageService

  constructor(config: { tokenKey?: string; refreshTokenKey?: string; storageService: StorageService }) {
    this.tokenKey = config.tokenKey || CORE_CONSTANTS.TOKEN_KEY
    this.refreshTokenKey = config.refreshTokenKey || CORE_CONSTANTS.REFRESH_TOKEN_KEY
    this.storageService = config.storageService
  }

  async storeTokens(tokens: { accessToken: string; refreshToken: string; expiresIn: number }): Promise<void> {
    await this.storageService.setItem(this.tokenKey, tokens.accessToken)
    await this.storageService.setItem(this.refreshTokenKey, tokens.refreshToken)
    const expirationTime = Date.now() + tokens.expiresIn * 1000
    await this.storageService.setItem('token_expiration', expirationTime)
  }

  async getAccessToken(): Promise<string | null> {
    return await this.storageService.getItem(this.tokenKey)
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.storageService.getItem(this.refreshTokenKey)
  }

  hasToken(): boolean {
    try {
      const raw = localStorage.getItem(`${CORE_CONSTANTS.STORAGE_PREFIX}${this.tokenKey}`)
      return !!raw
    } catch {
      return false
    }
  }

  async isTokenExpired(): Promise<boolean> {
    const expirationTime = await this.storageService.getItem<number>('token_expiration')
    if (!expirationTime) return true
    return Date.now() >= expirationTime
  }

  async clearTokens(): Promise<void> {
    await this.storageService.removeItem(this.tokenKey)
    await this.storageService.removeItem(this.refreshTokenKey)
    await this.storageService.removeItem('token_expiration')
  }
}
