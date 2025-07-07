export interface Transfert {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  transfertDate: Date;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransfertRequest {
  productId: string;
  productName: string;
  quantity: number;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
}

export interface TransfertResponse {
  success: boolean;
  message?: string;
  transfert?: Transfert;
}
