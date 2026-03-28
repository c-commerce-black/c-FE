"use client";

import { create } from "zustand";

type CheckoutState = {
  shippingAddress: string;
  selectedCartItemIds: string[];
  showPriceToast: boolean;
  setShippingAddress: (shippingAddress: string) => void;
  setSelectedCartItemIds: (selectedCartItemIds: string[]) => void;
  setShowPriceToast: (showPriceToast: boolean) => void;
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  shippingAddress: "",
  selectedCartItemIds: [],
  showPriceToast: false,
  setShippingAddress: (shippingAddress) => set({ shippingAddress }),
  setSelectedCartItemIds: (selectedCartItemIds) => set({ selectedCartItemIds }),
  setShowPriceToast: (showPriceToast) => set({ showPriceToast }),
}));
