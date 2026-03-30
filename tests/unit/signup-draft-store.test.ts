import { beforeEach, describe, expect, it } from "vitest";

import { useSignupDraftStore } from "@/stores/signup-draft-store";

describe("signup draft store", () => {
  beforeEach(() => {
    useSignupDraftStore.getState().reset();
  });

  it("does not track a role field anymore", () => {
    expect(useSignupDraftStore.getState()).not.toHaveProperty("role");
  });

  it("stores an optional shop name and resets cleanly", () => {
    useSignupDraftStore.getState().setField("shopName", "신선마켓 한남점");
    useSignupDraftStore.getState().setField("nickname", "홍길동");

    expect(useSignupDraftStore.getState().shopName).toBe("신선마켓 한남점");
    expect(useSignupDraftStore.getState().nickname).toBe("홍길동");

    useSignupDraftStore.getState().reset();

    expect(useSignupDraftStore.getState().shopName).toBe("");
    expect(useSignupDraftStore.getState().nickname).toBe("");
  });
});
