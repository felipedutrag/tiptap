import { supabase } from './supabase'
import { db, Contract, ContractVersion, SyncQueue } from './database'

export class SyncService {
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.startSync()
  }

  private handleOffline() {
    this.isOnline = false
    this.stopSync()
  }

  startSync() {
    if (!this.isOnline) return
    
    this.syncToServer()
    this.syncInterval = setInterval(() => {
      this.syncToServer()
    }, 5000) // Sync every 5 seconds
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncToServer() {
    try {
      const queue = await db.getSyncQueue()
      
      for (const item of queue) {
        await this.processSyncItem(item)
      }
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  private async processSyncItem(item: SyncQueue) {
    try {
      switch (item.table) {
        case 'contracts':
          await this.syncContract(item)
          break
        case 'contract_versions':
          await this.syncContractVersion(item)
          break
      }
      
      if (item.id) {
        await db.markSynced(item.id)
      }
    } catch (error) {
      console.error('Error processing sync item:', error)
    }
  }

  private async syncContract(item: SyncQueue) {
    const { data, error } = await supabase
      .from('contracts')
      .upsert(this.convertContractForSupabase(item.data))

    if (error) throw error

    // Update local record as synced
    await db.contracts.update(item.recordId, { synced: true })
  }

  private async syncContractVersion(item: SyncQueue) {
    const { data, error } = await supabase
      .from('contract_versions')
      .upsert(this.convertVersionForSupabase(item.data))

    if (error) throw error
  }

  private convertContractForSupabase(contract: Contract) {
    return {
      id: contract.id,
      title: contract.title,
      content: contract.content,
      user_id: contract.userId,
      paid: contract.paid,
      downloaded: contract.downloaded,
      updated_at: contract.updatedAt.toISOString(),
      version_number: contract.versionNumber
    }
  }

  private convertVersionForSupabase(version: ContractVersion) {
    return {
      id: version.id,
      contract_id: version.contractId,
      content: version.content,
      version_number: version.versionNumber,
      created_at: version.createdAt.toISOString(),
      created_by: version.createdBy
    }
  }

  async syncFromServer(userId: string) {
    try {
      // Sync contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', userId)

      if (contractsError) throw contractsError

      for (const contract of contracts || []) {
        await db.contracts.put(this.convertContractFromSupabase(contract))
      }

      // Sync contract versions
      const { data: versions, error: versionsError } = await supabase
        .from('contract_versions')
        .select('*')
        .in('contract_id', contracts?.map(c => c.id) || [])

      if (versionsError) throw versionsError

      for (const version of versions || []) {
        await db.contractVersions.put(this.convertVersionFromSupabase(version))
      }
    } catch (error) {
      console.error('Error syncing from server:', error)
    }
  }

  private convertContractFromSupabase(contract: any): Contract {
    return {
      id: contract.id,
      title: contract.title,
      content: contract.content,
      userId: contract.user_id,
      paid: contract.paid,
      downloaded: contract.downloaded,
      synced: true,
      updatedAt: new Date(contract.updated_at),
      createdAt: new Date(contract.created_at),
      versionNumber: contract.version_number,
      versions: []
    }
  }

  private convertVersionFromSupabase(version: any): ContractVersion {
    return {
      id: version.id,
      contractId: version.contract_id,
      content: version.content,
      versionNumber: version.version_number,
      createdAt: new Date(version.created_at),
      createdBy: version.created_by,
      nodes: []
    }
  }
}

export const syncService = new SyncService()
