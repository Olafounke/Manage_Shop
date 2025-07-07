export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderGroup: string;
  user: string;
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  status: 'PENDING' | 'VALIDATED' | 'PREPARED' | 'SHIPPED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderGroup {
  _id: string;
  user: string;
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
