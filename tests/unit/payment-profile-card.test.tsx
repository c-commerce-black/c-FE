import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mutate,
  paymentHistoryState,
  paymentProfileState,
  upsertPaymentProfileState,
} = vi.hoisted(() => ({
  mutate: vi.fn(),
  paymentHistoryState: {
    data: [],
    isLoading: false,
  },
  paymentProfileState: {
    data: {
      walletId: "wallet-user-001",
      depositAddress: "So11111111111111111111111111111111111111112",
      token: "USDC-test",
      balance: 12_000,
      updatedAt: 1_720_000_000_000,
    },
    isSuccess: true,
  } as {
    data: {
      walletId: string;
      depositAddress?: string | null;
      token: string;
      balance: number;
      updatedAt?: number;
    } | null;
    isSuccess: boolean;
  },
  upsertPaymentProfileState: {
    data: null,
    isPending: false,
    isError: false,
  } as {
    data: {
      walletId: string;
      depositAddress?: string | null;
      token: string;
      balance: number;
      updatedAt?: number;
    } | null;
    isPending: boolean;
    isError: boolean;
  },
}));

vi.mock("@/hooks/api", () => ({
  usePaymentHistoryQuery: () => paymentHistoryState,
  usePaymentProfileQuery: () => paymentProfileState,
  useUpsertPaymentProfileMutation: () => ({
    ...upsertPaymentProfileState,
    mutate,
  }),
}));

import { PaymentProfileCard } from "@/components/account/payment-profile-card";

describe("PaymentProfileCard", () => {
  beforeEach(() => {
    mutate.mockReset();
    paymentHistoryState.data = [];
    paymentHistoryState.isLoading = false;
    paymentProfileState.data = {
      walletId: "wallet-user-001",
      depositAddress: "So11111111111111111111111111111111111111112",
      token: "USDC-test",
      balance: 12_000,
      updatedAt: 1_720_000_000_000,
    };
    paymentProfileState.isSuccess = true;
    upsertPaymentProfileState.data = null;
    upsertPaymentProfileState.isPending = false;
    upsertPaymentProfileState.isError = false;
  });

  it("shows the deposit address on the account payment card", () => {
    render(<PaymentProfileCard />);

    expect(screen.getByText("wallet-user-001")).toBeVisible();
    expect(screen.getByText("So11111111111111111111111111111111111111112")).toBeVisible();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("creates a payment profile when the account has no wallet yet", async () => {
    paymentProfileState.data = null;

    render(<PaymentProfileCard />);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
  });
});
