import {
  readArray,
  readRecord,
  readString,
  readNumber,
  readTimestamp,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { PaymentProfile, WalletPaymentHistoryItem } from "./types";

function normalizePaymentProfile(raw: unknown): PaymentProfile | null {
  const record = readRecord(raw);
  if (!record) {
    return null;
  }

  const walletId = readString(record, ["walletId", "wallet_id"], "");
  if (!walletId) {
    return null;
  }

  return {
    walletId,
    depositAddress:
      readString(record, ["depositAddress", "deposit_address", "walletAddress", "wallet_address"], "") ||
      null,
    token: readString(record, ["token"], "USDC-test"),
    balance: readNumber(record, ["balance"], 0),
    updatedAt: readTimestamp(record, ["updatedAt", "updated_at"], 0) || undefined,
  };
}

export async function getPaymentProfile(token: string) {
  const response = await backendApi.get("/api/payments/profile", { token });
  const data = unwrapApiResponse<unknown>(
    response,
    "결제 지갑 정보를 불러오지 못했습니다.",
  );
  const record = readRecord(data) ?? {};

  return {
    paymentProfile: normalizePaymentProfile(record.paymentProfile ?? record.profile),
  };
}

function normalizeWalletPaymentHistoryItem(raw: unknown): WalletPaymentHistoryItem {
  const record = readRecord(raw) ?? {};
  return {
    id: readString(record, ["id"], ""),
    orderId: readString(record, ["orderId", "order_id"], ""),
    sellerShopName: readString(record, ["sellerShopName"], ""),
    payerNickname: readString(record, ["payerNickname"], "") || null,
    payeeNickname: readString(record, ["payeeNickname"], "") || null,
    token: readString(record, ["token"], "USDC-test"),
    amount: readNumber(record, ["amount"], 0),
    status: readString(record, ["status"], "PENDING") as WalletPaymentHistoryItem["status"],
    referenceId: readString(record, ["referenceId"], ""),
    transferId: readString(record, ["transferId"], "") || null,
    errorMessage: readString(record, ["errorMessage"], "") || null,
    direction: (readString(record, ["direction"], "") || null) as WalletPaymentHistoryItem["direction"],
    counterparty: readString(record, ["counterparty"], "") || null,
    paidAt: readTimestamp(record, ["paidAt"], 0) || undefined,
    updatedAt: readTimestamp(record, ["updatedAt"], 0) || undefined,
  };
}

export async function getPaymentHistory(token: string) {
  const response = await backendApi.get("/api/payments/history", { token });
  const data = unwrapApiResponse<unknown>(
    response,
    "결제 기록을 불러오지 못했습니다.",
  );
  const record = readRecord(data) ?? {};

  return {
    payments: readArray(record.payments).map(normalizeWalletPaymentHistoryItem),
  };
}
