import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteErrorPanel } from "@/components/shared/ui";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RouteErrorPanel", () => {
  it("logs the error and retries through the provided handler", async () => {
    const error = new Error("boom");
    const reset = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RouteErrorPanel
        error={error}
        reset={reset}
        eyebrow="오류 발생"
        title="화면을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(screen.getByText("오류 발생")).toBeVisible();
    expect(screen.getByText("화면을 불러오지 못했습니다")).toBeVisible();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
