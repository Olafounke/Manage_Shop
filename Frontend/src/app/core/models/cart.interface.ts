export interface CartItem {
  product: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  owner: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart?: Cart;
}
