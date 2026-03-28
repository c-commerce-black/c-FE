import { fetchBackend } from "@/lib/shared/api";
import type { Product } from "@/lib/catalog";

export type CartItem = {
  cartItemId?: string;
  id?: string;
  quantity: number;
  product: Pick<
    Product,
    | "id"
    | "name"
    | "currentPrice"
    | "originalPrice"
    | "status"
    | "imageUrl"
    | "dDay"
    | "discountRate"
  >;
};

export type CartSummary = {
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
};

export type CartState = {
  items: CartItem[];
  summary: CartSummary;
  priceChanged: boolean;
};

export async function getCart(token: string) {
  return fetchBackend<CartState>("/api/cart", { token });
}
