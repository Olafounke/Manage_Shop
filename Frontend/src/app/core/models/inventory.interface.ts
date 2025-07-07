export interface InventoryItem {
  id: number;
  productId: string;
  productName?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateInventoryItemRequest {
  quantity: number;
}

export interface InventoryOperationRequest {
  quantity: number;
}

export interface InventoryResponse {
  success: boolean;
  message?: string;
  data?: InventoryItem;
}
