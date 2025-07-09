export type StoreStatus = 'deployed' | 'deleting' | 'pending';

export interface Store {
  id: number;
  storeId: string;
  storeName: string;
  storeNameSlug: string;
  storeAddress: string;
  longitude?: string;
  latitude?: string;
  userId?: string;
  status?: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreRequest {
  storeName: string;
  storeAddress: string;
  userId?: string;
}

export interface UpdateStoreRequest {
  storeName?: string;
  storeAddress?: string;
  userId?: string;
}

export interface StoreResponse {
  success: boolean;
  message: string;
  scriptOutput?: string;
  storeId?: string;
}
