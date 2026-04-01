"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { useLogoutMutation } from "@/hooks/api";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const setUser = useAuthStore((state) => state.setUser);

  return (
    <Button
      variant="outline"
      disabled={logoutMutation.isPending}
      onClick={() => {
        void logoutMutation.mutateAsync().then(() => {
          setUser(null);
          router.push("/login");
          router.refresh();
        });
      }}
    >
      {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
