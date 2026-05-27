export type PaymentProfile = {
  walletId: string;
  token: string;
  balance: number;
  updatedAt?: number;
};

export type WalletPaymentHistoryItem = {
  id: string;
  orderId: string;
  sellerShopName: string;
  payerNickname?: string | null;
  payeeNickname?: string | null;
  token: string;
  amount: number;
  status: "PENDING" | "FAILED" | "COMPLETED";
  referenceId: string;
  transferId?: string | null;
  errorMessage?: string | null;
  direction: "IN" | "OUT" | null;
  counterparty?: string | null;
  paidAt?: number;
  updatedAt?: number;
};
