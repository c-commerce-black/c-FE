export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type SellerOrderStatus = Exclude<OrderStatus, "PENDING" | "CANCELLED">;

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  dDay?: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingAddress: string;
  createdAt: number;
  updatedAt?: number;
  items: OrderItem[];
};
