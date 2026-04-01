import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginForm", () => {
  it("hides deferred auth helper actions", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>,
    );

    expect(screen.queryByText("비밀번호를 잊으셨나요?")).not.toBeInTheDocument();
    expect(screen.queryByText("Google로 계속하기")).not.toBeInTheDocument();
  });
});
