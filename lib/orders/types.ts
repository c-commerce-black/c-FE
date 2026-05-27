export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type OrderPaymentStatus = "UNPAID" | "FAILED" | "PARTIAL" | "PAID";

export type SellerOrderStatus = Exclude<OrderStatus, "PENDING" | "CANCELLED">;

export type OrderItem = {
  productId: string;
  sellerId?: string;
  sellerShopName?: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  dDay?: number;
};

export type OrderPayment = {
  id: string;
  sellerId: string;
  sellerShopName: string;
  payeeNickname?: string | null;
  token: string;
  amount: number;
  status: "PENDING" | "FAILED" | "COMPLETED";
  referenceId: string;
  transferId?: string | null;
  errorMessage?: string | null;
  paidAt?: number;
  updatedAt?: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingAddress: string;
  createdAt: number;
  paidAt?: number;
  updatedAt?: number;
  items: OrderItem[];
  payments: OrderPayment[];
};
