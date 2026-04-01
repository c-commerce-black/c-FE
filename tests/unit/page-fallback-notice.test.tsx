import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageFallbackNotice } from "@/components/shared/ui";

describe("PageFallbackNotice", () => {
  it("renders the provided fallback message", () => {
    render(
      <PageFallbackNotice message="일부 정보를 최신 상태로 불러오지 못했어요." />,
    );

    expect(
      screen.getByText("일부 정보를 최신 상태로 불러오지 못했어요."),
    ).toBeVisible();
  });
});
