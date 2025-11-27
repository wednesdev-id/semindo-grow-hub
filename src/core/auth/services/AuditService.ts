import { StorageService } from '../../infrastructure/storage/StorageService'
import { ApiClient } from '../../infrastructure/api/ApiClient'
import { AuditLog, LocalAuditLog } from '../types'

export class AuditService {
  private apiClient: ApiClient
  private storageService: StorageService

  constructor(config: { apiClient: ApiClient; storageService: StorageService }) {
    this.apiClient = config.apiClient
    this.storageService = config.storageService
  }

  async log(auditData: AuditLog): Promise<void> {
    await this.storeLocalAudit(auditData)
    try {
      await this.apiClient.post('/audit/logs', auditData)
      await this.markLocalAuditsSynced()
    } catch (error) {
      console.error('Audit send failed', error)
    }
  }

  private async storeLocalAudit(auditData: AuditLog): Promise<void> {
    const logs: LocalAuditLog[] =
      (await this.storageService.getItem<LocalAuditLog[]>('pending_audit_logs')) || []
    logs.push({ 
      ...auditData, 
      timestamp: auditData.timestamp.toISOString(), 
      synced: false 
    })
    await this.storageService.setItem('pending_audit_logs', logs)
  }

  private async markLocalAuditsSynced(): Promise<void> {
    const logs: LocalAuditLog[] =
      (await this.storageService.getItem<LocalAuditLog[]>('pending_audit_logs')) || []
    const updated = logs.map(l => ({ ...l, synced: true }))
    await this.storageService.setItem('pending_audit_logs', updated)
  }
}
