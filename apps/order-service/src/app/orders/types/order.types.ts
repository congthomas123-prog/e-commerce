export type OrderItemResponse = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPriceAmount: number;
  quantity: number;
  lineTotalAmount: number;
};

export type OrderStatusValue = 'DRAFT' | 'SUBMITTED' | 'CANCELLED';

export type OrderResponse = {
  id: string;
  customerId: string;
  status: OrderStatusValue;
  currency: string;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: Date;
  updatedAt: Date;
};
