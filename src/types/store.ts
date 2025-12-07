// Store 관련 타입 정의

export interface Store {
  storeId: string
  ownerUserId: string
  name: string
  description?: string
  status: StoreStatus
  createdAt: string
  updatedAt: string
}

export enum StoreStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface StoreRegisterRequest {
  name: string
  description?: string
}

export interface StoreUpdateRequest {
  name?: string
  description?: string
}
