"use client";

import { create } from "zustand";

import type { Role, TermsKey } from "@/lib/types";

type SignupDraft = {
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: Role;
  shopName: string;
  agreements: Record<TermsKey, boolean>;
  setField: <K extends Exclude<keyof SignupDraft, "agreements" | "setField" | "toggleAgreement" | "toggleAll">>(
    field: K,
    value: SignupDraft[K],
  ) => void;
  toggleAgreement: (key: TermsKey) => void;
  toggleAll: () => void;
  reset: () => void;
};

const initialAgreements: Record<TermsKey, boolean> = {
  terms: false,
  privacy: false,
  marketing: false,
};

const initialState = {
  nickname: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "BUYER" as Role,
  shopName: "",
  agreements: initialAgreements,
};

export const useSignupDraftStore = create<SignupDraft>((set) => ({
  ...initialState,
  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),
  toggleAgreement: (key) =>
    set((state) => ({
      agreements: {
        ...state.agreements,
        [key]: !state.agreements[key],
      },
    })),
  toggleAll: () =>
    set((state) => {
      const next = !Object.values(state.agreements).every(Boolean);
      return {
        agreements: {
          terms: next,
          privacy: next,
          marketing: next,
        },
      };
    }),
  reset: () => set(initialState),
}));
