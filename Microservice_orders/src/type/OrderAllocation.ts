export interface EnrichedCart {
  owner: string;
  userAdress: {
    fullAddress: string;
    longitude: number;
    latitude: number;
  };
  items: CartItem[];
  total: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  stores: Array<{
    storeId: string;
    storeName: string;
    storeAdress: {
      longitude: number;
      latitude: number;
    };
    quantityAvailable: number;
  }>;
}

export interface StoreAllocation {
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
}

export interface StoreWithDistance {
  storeId: string;
  storeName: string;
  storeAdress: {
    longitude: number;
    latitude: number;
  };
  quantityAvailable: number;
  distance: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface InventoryUpdate {
  storeId: string;
  productId: string;
  quantity: number;
}

export type InventoryUpdates = InventoryUpdate[];
