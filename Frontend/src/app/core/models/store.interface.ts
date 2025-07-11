export type StoreStatus = 'deployed' | 'deleting' | 'pending';

export interface Store {
  id: number;
  storeId: string;
  name: string;
  nameSlug: string;
  address: string;
  longitude?: string;
  latitude?: string;
  userId?: string;
  status?: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
  port: number;
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
