export type ProductResponse = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  inventoryCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
