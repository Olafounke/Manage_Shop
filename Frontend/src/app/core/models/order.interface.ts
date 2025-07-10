export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  _id?: string;
}

export interface OrderGroup {
  _id: string;
  user: string;
  userName: string;
  userEmail: string;
  userAddress: {
    fullAddress: string;
    longitude: number;
    latitude: number;
  };
  totalAmount: number;
  status:
    | 'PENDING'
    | 'VALIDATED'
    | 'PARTIALLY_SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';
  orders: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderGroup: OrderGroup;
  user: string;
  storeId: string;
  storeName?: string;
  items: OrderItem[];
  subtotal: number;
  status: 'PENDING' | 'VALIDATED' | 'PREPARED' | 'SHIPPED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentStatus {
  success: boolean;
  orderId?: string;
  message?: string;
  inventoryUpdates?: InventoryUpdate[];
}

export interface InventoryUpdate {
  storeId: string;
  productId: string;
  quantity: number;
}

export interface CreateCheckoutRequest {
  userAddress: UserAddress;
}

export interface UpdateOrderStatusRequest {
  status: string;
}
