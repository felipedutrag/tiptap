import Dexie, { Table } from 'dexie'

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  synced: boolean
}

export interface ContractNode {
  id: string
  type: 'titulo' | 'parte' | 'clausula' | 'inciso' | 'paragrafo' | 'assinatura'
  content: string
  order: number
  createdByAI: boolean
}

export interface ContractVersion {
  id: string
  contractId: string
  nodes: ContractNode[]
  content: any
  createdAt: Date
  versionNumber: number
  createdBy: string
}

export interface Contract {
  id: string
  title: string
  content: any
  userId: string
  versions: ContractVersion[]
  paid: boolean
  downloaded: boolean
  synced: boolean
  updatedAt: Date
  createdAt: Date
  versionNumber: number
}

export interface Payment {
  id: string
  contractId: string
  userId: string
  amount: number
  status: 'pending' | 'confirmed' | 'failed'
  pixCode?: string
  createdAt: Date
  confirmedAt?: Date
}

export interface SyncQueue {
  id?: number
  action: 'create' | 'update' | 'delete'
  table: string
  recordId: string
  data: any
  timestamp: Date
  synced: boolean
}

export class ContractsDB extends Dexie {
  users!: Table<User>
  contracts!: Table<Contract>
  contractVersions!: Table<ContractVersion>
  payments!: Table<Payment>
  syncQueue!: Table<SyncQueue>

  constructor() {
    super('ContractsDB')
    
    this.version(1).stores({
      users: 'id, email, synced',
      contracts: 'id, userId, title, synced, updatedAt, createdAt',
      contractVersions: 'id, contractId, versionNumber, createdAt',
      payments: 'id, contractId, userId, status, createdAt',
      syncQueue: '++id, table, recordId, timestamp, synced'
    })
  }

  async addToSyncQueue(action: SyncQueue['action'], table: string, recordId: string, data: any) {
    await this.syncQueue.add({
      action,
      table,
      recordId,
      data,
      timestamp: new Date(),
      synced: false
    })
  }

  async getSyncQueue() {
    return await this.syncQueue.where('synced').equals(0).toArray()
  }

  async markSynced(id: number) {
    await this.syncQueue.update(id, { synced: true })
  }

  async saveContract(contract: Contract) {
    await this.contracts.put(contract)
    await this.addToSyncQueue('update', 'contracts', contract.id, contract)
  }

  async saveContractVersion(version: ContractVersion) {
    await this.contractVersions.put(version)
    await this.addToSyncQueue('create', 'contract_versions', version.id, version)
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return await this.contracts.get(id)
  }

  async getContractVersions(contractId: string): Promise<ContractVersion[]> {
    return await this.contractVersions
      .where('contractId')
      .equals(contractId)
      .reverse()
      .toArray()
  }

  async getUserContracts(userId: string): Promise<Contract[]> {
    return await this.contracts
      .where('userId')
      .equals(userId)
      .reverse()
      .toArray()
  }
}

export const db = new ContractsDB()
